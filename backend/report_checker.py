import os, re, math
from collections import Counter
from pypdf import PdfReader
from dotenv import load_dotenv
load_dotenv()

def extract_text_from_pdf(file_path):
    reader = PdfReader(file_path)
    pages = []
    for i, page in enumerate(reader.pages):
        text = page.extract_text()
        if text and text.strip():
            pages.append({"page": i + 1, "text": text.strip()})
    return pages

def get_sentences(text):
    sentences = re.split(r'(?<=[.!?])\s+', text)
    return [s.strip() for s in sentences if len(s.strip().split()) > 4]

def get_words(text):
    return re.findall(r'\b[a-zA-Z]{2,}\b', text.lower())

def get_content_words(words):
    if not words: return []
    freq = Counter(words)
    total = len(words)
    stopwords = {w for w,c in freq.items() if c/total > 0.025}
    return [w for w in words if w not in stopwords]

def is_reference_block(line):
    patterns = [r'^\d+\.\s+[A-Z]', r'https?://', r'doi\.org', r'^\[\d+\]', r'\(\d{4}\)', r'Vol\.\s*\d+|pp\.\s*\d+']
    return any(re.search(p, line) for p in patterns)

def is_non_prose(line):
    s = line.strip()
    if not s or len(s.split()) < 5: return True
    if re.match(r'^[*\-▪◦→]\s', s): return True
    return sum(1 for c in s if c.isalpha()) / max(len(s),1) < 0.5

def clean_for_analysis(text):
    lines = text.split('\n')
    qualifying = []
    in_refs = False
    for line in lines:
        if re.match(r'^\s*(references|bibliography|works cited)\s*$', line, re.IGNORECASE):
            in_refs = True; continue
        if in_refs: continue
        if is_reference_block(line) or is_non_prose(line): continue
        qualifying.append(line.strip())
    return ' '.join(qualifying)

def burstiness_score(sentences):
    if len(sentences) < 4: return 55.0
    lengths = [len(s.split()) for s in sentences]
    mean = sum(lengths)/len(lengths)
    if mean == 0: return 55.0
    std = math.sqrt(sum((l-mean)**2 for l in lengths)/len(lengths))
    return round(max(0, min(100, 100-(std/mean)*180)), 1)

def transition_density(text):
    transitions = ['furthermore','consequently','moreover','therefore','thus','additionally','specifically','notably','importantly','ultimately','in conclusion','in summary','as a result','on the other hand','in contrast','for instance','significantly','essentially','it is worth noting','it is important to note','in this context','it should be noted','it can be observed','in this regard','with respect to','in light of','it is evident','it is clear that','plays a crucial role','plays a key role']
    lower = text.lower()
    count = sum(lower.count(t) for t in transitions)
    ratio = count / max(len(text.split()), 1)
    return round(max(0, min(100, (ratio-0.004)*3200)), 1)

def avg_sentence_length_score(sentences):
    if not sentences: return 0.0
    avg = sum(len(s.split()) for s in sentences)/len(sentences)
    return round(max(0, min(100, (avg-12)*5)), 1)

def morpheme_score(words):
    if len(words) < 15: return 50.0
    ai_suffixes = ('tion','ment','ity','ance','ence','ness','ism','ical','ative','itive','ization','isation','ology','ographic','metric','logical')
    count = sum(1 for w in words if any(w.endswith(s) for s in ai_suffixes))
    ratio = count/len(words)
    return round(max(0, min(100, (ratio-0.03)*850)), 1)

def hedge_reduction(text):
    words = text.lower().split()
    hedge_words = ['may','might','could','suggest','suggests','suggested','appear','appears','seem','seems','likely','possibly','perhaps','probably','indicate','indicates','typically','often','generally','relatively','approximately','somewhat']
    ratio = sum(1 for w in words if w in hedge_words)/max(len(words),1)
    return round(max(0, min(40, ratio*1200)), 1)

def casual_marker_score(text):
    patterns = [r'\bhonestly\b',r'\bkind of\b',r'\bsort of\b',r'\blike,\b',r'\byou know\b',r'\bright\?',r'\bso yeah\b',r'\byeah\b',r'\bokay\b',r'\bpretty much\b',r'\bbasically\b',r'\bliterally\b',r'\btotally\b',r'\bactually\b',r'\bweird\b',r'\bcrazy\b',r'\bthing is\b',r'\bi mean\b',r'\bnot gonna lie\b',r'\bfeel like\b',r'\bto be fair\b',r'\bguess\b',r'\bstuff\b']
    lower = text.lower()
    count = sum(len(re.findall(p, lower)) for p in patterns)
    ratio = count/max(len(text.split()),1)
    return round(max(0, min(100, ratio*1800)), 1)

def calculate_ai_probability(raw_text):
    text = clean_for_analysis(raw_text)
    sentences = get_sentences(text)
    words = get_words(text)
    if len(sentences) < 3 or len(words) < 30:
        return {"ai_probability":0,"human_probability":100,"signals":{},"humanization":{"detected":False,"score":0,"register_variance":0},"classification":"insufficient_text","qualifying_sentences":len(sentences)}
    s1 = burstiness_score(sentences)
    s2 = transition_density(text)
    s3 = avg_sentence_length_score(sentences)
    s4 = morpheme_score(words)
    s5 = hedge_reduction(text)
    s6 = casual_marker_score(text)
    base = s2*0.28 + s1*0.22 + s3*0.26 + s4*0.24
    boost1 = 10 if (s1>50 and s2>20) else 0
    boost2 = 28 if (s3>45 and s1>45 and s4>25) else 0
    boost3 = 8 if s2>30 else 0
    boost = max(boost1, boost2, boost3)
    score = max(3, min(95, base+boost-s5))
    lc = min(1.0, len(sentences)/20)
    ai_prob = round(min(95, max(3, score*(0.92+0.04*lc))), 1)
    humanization_detected = s6>15 and s1>40 and ai_prob>20
    if humanization_detected:
        ai_prob = round(min(95, ai_prob+min(25,s6*0.35)), 1)
    if humanization_detected and ai_prob>=35: classification="humanized_ai"
    elif ai_prob>=60: classification="ai"
    elif ai_prob>=28: classification="mixed"
    else: classification="human"
    return {"ai_probability":ai_prob,"human_probability":round(100-ai_prob,1),"signals":{"burstiness":s1,"transition_density":s2,"avg_sentence_length":s3,"morpheme_density":s4,"hedging_score":round(100-s5,1),"casual_markers":s6},"humanization":{"detected":humanization_detected,"score":round(s6,1),"register_variance":round(s6,1)},"classification":classification,"qualifying_sentences":len(sentences)}

def check_similarity_in_memory(text):
    try:
        from memory import search_memory
        results = search_memory(text, k=3)
        matches = []
        for r in results:
            overlap = calculate_overlap(text, r.page_content)
            if overlap > 28:
                matches.append({"source":r.metadata.get("source","unknown"),"page":r.metadata.get("page","?"),"overlap_score":overlap,"matched_text":r.page_content[:200]+"..."})
        return matches
    except Exception:
        return []

def calculate_overlap(text1, text2):
    w1 = set(get_content_words(get_words(text1)))
    w2 = set(get_content_words(get_words(text2)))
    if not w1 or not w2: return 0
    return round(len(w1&w2)/len(w1|w2)*100, 1)

def check_report(file_path):
    pages = extract_text_from_pdf(file_path)
    if not pages: return {"error":"Could not extract text from PDF"}
    total_raw = " ".join([p["text"] for p in pages])
    total_words = len(total_raw.split())
    total_qualifying = clean_for_analysis(total_raw)
    qualifying_words = len(total_qualifying.split())
    page_results = []
    all_ai_scores = []
    all_similarity_matches = []
    for i in range(0, len(pages), 3):
        group = pages[i:i+3]
        chunk_raw = " ".join([p["text"] for p in group])
        page_label = f"{group[0]['page']}-{group[-1]['page']}" if len(group)>1 else str(group[0]['page'])
        ai_result = calculate_ai_probability(chunk_raw)
        if ai_result["qualifying_sentences"] >= 3:
            all_ai_scores.append(ai_result["ai_probability"])
        try: sim_matches = check_similarity_in_memory(chunk_raw[:600])
        except Exception: sim_matches = []
        all_similarity_matches.extend(sim_matches)
        page_results.append({"pages":page_label,"ai_probability":ai_result["ai_probability"],"human_probability":ai_result["human_probability"],"classification":ai_result["classification"],"qualifying_sentences":ai_result["qualifying_sentences"],"signals":ai_result["signals"],"humanization":ai_result.get("humanization",{}),"similarity_matches":sim_matches})
    overall_ai = round(sum(all_ai_scores)/len(all_ai_scores),1) if all_ai_scores else 0
    overall_result = calculate_ai_probability(total_raw)
    risk = "HIGH" if overall_ai>=60 else "MEDIUM" if overall_ai>=28 else "LOW"
    return {"file":os.path.basename(file_path),"total_pages":len(pages),"total_words":total_words,"qualifying_words":qualifying_words,"total_sentences":len(get_sentences(total_qualifying)),"overall_ai_probability":overall_ai,"overall_human_probability":round(100-overall_ai,1),"risk_level":risk,"overall_signals":overall_result["signals"],"humanization_overall":overall_result.get("humanization",{}),"similarity_matches_total":len(all_similarity_matches),"page_results":page_results}