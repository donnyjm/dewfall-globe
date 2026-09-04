#!/usr/bin/env python3
import json, urllib.parse, urllib.request, time, re, os
from collections import defaultdict

BASE = "https://proxyinternet.nrcan-rncan.gc.ca/arcgis/rest/services/CLSS-SATC/CLSS_Administrative_Boundaries/MapServer/0/query"
TYPES = {
    "IR": "Indian Reserve",
    "IL": "Indian Land",
    "SHL": "Sechelt Land",
    "CRN": "Cree and Naskapi Category 1A and 1A-N Land",
    "SRN": "Salt River First Nation Settlement Land",
    "YFN": "Yukon First Nations Settlement Land",
}
PAGE = 500
OUT_FIELDS = "OBJECTID,adminAreaId,adminAreaNameEng,adminAreaNameAlt1,distributionType,distributionTypeEng,adminRegion,adminRegionEng,jurisdiction,jurisdictionEng,SHAPE_Area"

def query(**params):
    url = BASE + "?" + urllib.parse.urlencode(dict(f="json", **params))
    with urllib.request.urlopen(url, timeout=120) as r:
        return json.loads(r.read().decode("utf-8"))

def ring_centroid(ring):
    if not ring or len(ring) < 3:
        return None, 0.0
    pts = ring[:]
    if pts[0] != pts[-1]:
        pts = pts + [pts[0]]
    a = cx = cy = 0.0
    for i in range(len(pts) - 1):
        x0, y0 = pts[i][0], pts[i][1]
        x1, y1 = pts[i+1][0], pts[i+1][1]
        cross = x0 * y1 - x1 * y0
        a += cross
        cx += (x0 + x1) * cross
        cy += (y0 + y1) * cross
    a *= 0.5
    if abs(a) < 1e-18:
        xs = [p[0] for p in ring]; ys = [p[1] for p in ring]
        return (sum(xs)/len(xs), sum(ys)/len(ys)), 0.0
    return (cx/(6.0*a), cy/(6.0*a)), abs(a)

def feature_centroid(geom, shape_area):
    rings = (geom or {}).get("rings") or []
    if not rings: return None
    best = None; best_a = -1.0
    for ring in rings:
        c, a = ring_centroid(ring)
        if c is None: continue
        if a > best_a:
            best_a = a; best = c
    if best is None: return None
    return {"lng": round(best[0], 5), "lat": round(best[1], 5), "area": shape_area or best_a}

def normalize_name(s):
    if not s: return ""
    s = s.upper().strip()
    s = re.sub(r"\s+", " ", s)
    s = re.sub(r"\bI\.?R\.?\b", " ", s)
    s = re.sub(r"\bNO\.?\s*\d+[A-Z\-]*\b", " ", s)
    s = re.sub(r"\b\d+[A-Z]?\b", " ", s)
    s = re.sub(r"[^A-Z0-9 ]", " ", s)
    return re.sub(r"\s+", " ", s).strip()

def dedupe_key(attrs):
    name = attrs.get("adminAreaNameEng") or attrs.get("adminAreaNameAlt1") or ""
    return (normalize_name(name), attrs.get("jurisdiction") or "", attrs.get("distributionType") or "")

def fetch_type(dtype):
    print(f"Fetching {dtype}...", flush=True)
    all_feats = []; offset = 0
    while True:
        data = query(
            where="distributionType='"+dtype+"'",
            outFields=OUT_FIELDS,
            returnGeometry="true", outSR="4326",
            maxAllowableOffset="0.02",
            resultOffset=str(offset), resultRecordCount=str(PAGE),
            orderByFields="OBJECTID ASC",
        )
        feats = data.get("features") or []
        if not feats: break
        all_feats.extend(feats)
        print(f"  {dtype}: {len(all_feats)} (+{len(feats)})", flush=True)
        if not data.get("exceededTransferLimit") and len(feats) < PAGE: break
        offset += len(feats)
        time.sleep(0.12)
    return all_feats

def main():
    by_key = {}; type_counts_raw = {}
    for dtype in TYPES:
        feats = fetch_type(dtype)
        type_counts_raw[dtype] = len(feats)
        for f in feats:
            attrs = f.get("attributes") or {}
            c = feature_centroid(f.get("geometry"), attrs.get("SHAPE_Area"))
            if not c: continue
            key = dedupe_key(attrs)
            name = attrs.get("adminAreaNameEng") or attrs.get("adminAreaNameAlt1") or "Unknown"
            rec = {
                "id": attrs.get("adminAreaId") or str(attrs.get("OBJECTID")),
                "name": name.title() if name == name.upper() else name,
                "nameRaw": name,
                "alt": attrs.get("adminAreaNameAlt1") or None,
                "type": attrs.get("distributionType"),
                "typeLabel": attrs.get("distributionTypeEng") or TYPES.get(dtype, dtype),
                "province": attrs.get("jurisdiction") or None,
                "lat": c["lat"], "lng": c["lng"],
                "area": attrs.get("SHAPE_Area") or 0,
            }
            prev = by_key.get(key)
            if prev is None or (rec["area"] or 0) > (prev["area"] or 0):
                by_key[key] = rec
    reserves = sorted(by_key.values(), key=lambda r: (r.get("province") or "", r["name"]))
    out = []; type_counts = defaultdict(int)
    for r in reserves:
        type_counts[r["type"]] += 1
        out.append({
            "id": "ir-" + str(r["id"]),
            "name": r["name"], "alt": r["alt"],
            "type": r["type"], "typeLabel": r["typeLabel"],
            "province": r["province"],
            "lat": r["lat"], "lng": r["lng"],
        })
    meta = {
        "source": "Natural Resources Canada — Aboriginal Lands of Canada Legislative Boundaries",
        "sourceUrl": BASE.rsplit("/query",1)[0],
        "fetched": time.strftime("%Y-%m-%d"),
        "rawPolygonCounts": dict(type_counts_raw),
        "dedupedCountsByType": dict(type_counts),
        "totalDeduped": len(out),
        "defaultTypes": ["IR"],
        "optionalTypes": ["IL","SHL","CRN","SRN","YFN"],
        "excludedTypes": ["IOL","INV","GWN","STU","TLC"],
        "notes": "Centroids from simplified rings; same-name+province+type deduped to largest part.",
    }
    path_js = "/workspace/dewfall-globe/data/fn-reserves.js"
    with open(path_js, "w") as f:
        f.write("/**\n * DEWFALL — First Nations reserve centroids (NRCan ALC)\n")
        f.write(f" * Deduped pins: {len(out)} · IR default; optional IL/SHL/CRN/SRN/YFN\n")
        f.write(f" * Fetched {meta["fetched"]}. Centroids only.\n */\n")
        f.write("window.DEWFALL_FN_RESERVES_META = ")
        json.dump(meta, f, indent=2)
        f.write(";\nwindow.DEWFALL_FN_RESERVES = ")
        json.dump(out, f, separators=(",", ":"))
        f.write(";\n")
    print("Wrote", path_js, "count=", len(out), "types=", dict(type_counts))
    print("Raw:", dict(type_counts_raw), "KB:", round(os.path.getsize(path_js)/1024,1))

if __name__ == "__main__":
    main()
