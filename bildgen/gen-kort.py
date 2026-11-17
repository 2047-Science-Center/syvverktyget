# Genererar svepkortens bilder (situationer i stunden i Valvet) med gpt-image-2.
# Samma väg som trailern och reveal-filmen (se ../../xy-trailer/film/verktyg/gen-bild.py).
# Nyckel: ../../xy-bildgen/.env (OPENAI_API_KEY), skrivs aldrig ut.
#
# Kör från syvverktyget/:
#   python3 bildgen/gen-kort.py                 # alla som saknas
#   python3 bildgen/gen-kort.py diplomatkaren   # ett helt valv (som saknas)
#   python3 bildgen/gen-kort.py driften/kodvavaren --om   # en roll, skriv över
# Utkast hamnar i bildgen/utkast/<valv>/<id>.png. Godkända kopieras till public/cards/<valv>/<id>.png.
# Rollistan: ../KORTLEK.md
import base64, json, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

HIT = Path(__file__).resolve().parent
ENV = HIT.parent.parent / "xy-bildgen/.env"
KEY = next(l.split("=", 1)[1].strip().strip('"') for l in ENV.read_text().splitlines() if l.startswith("OPENAI_API_KEY="))
UT = HIT / "utkast"

def stil(farg):
    # Stilankare: samma värld som stationerna och clip-drift-2 (markförvaltaren i odlingstältet).
    return ("Candid in-the-moment photograph, as if snapped by a colleague with a 35mm camera: slightly imperfect framing, "
            "real motion, nobody posing for the camera. Setting: Valvet, a Swedish underground civil-defence community that has "
            "rebuilt society from scratch: olive-green painted steel, raw concrete, 1980s analog hardware, amber CRT screens, "
            f"warm work lamps, cables and pipes. Everyone wears loose {farg} team work overalls. "
            "Young adults, genuinely absorbed in the task. The situation has a dry, warm sense of humour. Filmic, slightly muted "
            "colours, warm amber key light, soft film grain, shallow depth of field. NO readable text, NO letters, NO logos, NO signage. ")

FARG = {
    "driften": "mustard-yellow",
    "diplomatkaren": "muted grass-green",
    "forskningslaget": "muted mid-blue",
    "teknologerna": "brick-red",
}

ROLLER = {
  "driften": {
    "processoperatoren": "A process control room with a wall of analog gauges and glowing amber CRT monitors. The operator catches a tipping "
        "coffee mug with one hand while pressing a big illuminated acknowledge button with the other, a red warning lamp flashing "
        "on the panel. Focused, unbothered expression.",
    "faltteknikern": "A concrete service corridor. A technician is halfway inside a large square ventilation duct, only legs and work boots "
        "sticking out, a flashlight beam glowing from inside the duct, one gloved hand giving a thumbs-up through a metal grille further "
        "along the duct. A colleague holds an open toolbox and laughs.",
    "faltmedikern": "The bunker canteen at a long table with metal trays and soup bowls. A field medic with an open red first-aid bag carefully "
        "bandages a colleague's thumb; the whole table leans in to watch, one person peeks through their fingers, another holds a spoon "
        "frozen halfway to their mouth.",
    "harbargesvarden": "A busy bunker kitchen during lunch rush, steam and big steel pots. A cook strides through the frame balancing six full "
        "plates along both arms at the exact moment the ceiling lights flicker; colleagues duck and grin, slight motion blur on the plates.",
    "vattenmastaren": "A water treatment hall with large pipes, valves and steel tanks. A water technician holds a glass sample flask up against "
        "a work lamp and squints at it critically; behind them a colleague holds out a tin cup, eyebrows raised, waiting to taste.",
    "virkeslaget": "An enormous underground forest hall with rows of young spruce trees under warm grow lights. Seen through the side window of "
        "a vintage forestry harvester cab: the driver works two joysticks with one hand, a freshly cut log hangs in the grapple outside, "
        "and with the other hand the driver takes a bite of a sandwich.",
    "incidentledaren": "A corridor bathed in rotating red alarm light, people in yellow overalls rushing past in motion blur. In the middle one "
        "person stands completely calm and still, holding a walkie-talkie to their mouth and a thermos cup in the other hand, the only "
        "sharp figure in the frame.",
  },
  "diplomatkaren": {
    "sandebudet": "A small bunker negotiation room with a long worn wooden table and two heavy steel doors facing each other. A negotiator "
        "stands between two groups who are leaning in from each side of the table, calmly sliding a single sheet of paper to the middle "
        "with two fingers; one side has arms crossed, the other is mid-argument with hands raised.",
    "allianslanken": "A narrow radio room with an old switchboard and three vintage telephones. One person has a receiver at each ear and a "
        "third phone ringing on the desk, writing on a notepad with the free hand and smiling, completely in control.",
    "radgivaren": "A planning room with a big corkboard full of paper notes and red string that has turned into a tangled mess. Four colleagues "
        "stare at it helplessly; one person on a chair reaches up and pulls a single pin, and the whole string web is about to fall into "
        "a clean line.",
    "kvartermastaren": "A tall supply depot with shelves of crates, canned food and spare parts. A quartermaster rides a rolling library ladder "
        "along the shelves at speed, clipboard in one hand, pulling a crate down with the other, while a colleague below catches boxes.",
    "talespersonen": "A bunker PA booth with a big vintage desk microphone and a small window into a crowded canteen. The spokesperson is "
        "mid-sentence, leaning into the microphone with an expressive hand gesture; through the window the whole canteen has stopped "
        "eating and turned to listen to the loudspeaker.",
    "vagledaren": "A small bunker classroom with mismatched chairs and a chalk-dusted blackboard covered in drawings, no letters. A guide crouches "
        "next to a nervous newcomer who is holding a heavy wrench for the first time, showing the grip with their own hands; two others "
        "in the background cheer quietly.",
    "lyssnaren": "A quiet corner of the bunker with two worn armchairs, a lamp and a box of tissues on a crate. A counsellor sits leaning "
        "forward, listening with full attention to someone mid-story, a cup of tea in each person's hands; through the doorway colleagues "
        "tiptoe past carrying equipment.",
    "lagbyggaren": "A big table covered in rows of small photo cards of people, like a board game. Someone in green overalls moves two cards "
        "next to each other with total concentration; three colleagues lean over the table watching like it's a chess final.",
  },
  "forskningslaget": {
    "experimentledaren": "A bunker laboratory with glass flasks, tubes and a home-built apparatus of hoses and valves. A small harmless puff "
        "of white smoke rises from the experiment; the researcher, safety goggles pushed up on the forehead and face slightly sooty, is "
        "already writing a note, while a colleague holds a fire extinguisher just in case.",
    "kodvavaren": "A cramped computer room with stacks of amber CRT terminals and bundles of cables. A programmer types with total focus with "
        "a pencil held in the mouth; a long continuous paper printout spills from an old printer across the floor, and a colleague stands "
        "in the doorway holding up a broken cable, looking hopeful.",
    "datatydaren": "A dim room with a wall-sized amber CRT screen full of glowing dots and graphs, no numbers or letters. A data analyst stands "
        "close to the screen pointing at one single dot with a pen; three colleagues behind them lean forward, one has their mouth open "
        "in realisation.",
    "materialutforskaren": "A materials lab with a hydraulic press and samples of metal, glass and fabric laid out on a steel bench. The "
        "researcher bends a strip of strange material with both hands and it springs back perfectly; a colleague with goggles stares, "
        "holding an identical strip that has snapped in two.",
    "faltforskaren": "An underground cave lake inside the bunker with dripping stalactites and work lamps. A field scientist in waders stands "
        "knee-deep in the water holding a sample jar up to a head torch, while a colleague on the shore holds a measuring rod and a "
        "notebook and points at something swimming in the jar.",
    "smittsparare": "A bunker diagnostics lab with a vintage microscope and racks of sample tubes. The analyst looks into the microscope, "
        "one hand raised to stop everyone; behind them a line of colleagues with their sleeves rolled up for samples waits patiently, one "
        "of them nervously looking away from a cotton swab.",
    "sparsakraren": "A storeroom scene taped off with string and small numbered markers (no digits visible). A forensic technician kneels with "
        "a large magnifying glass over a single boot print in flour on the concrete floor; a colleague behind holds up an empty cookie "
        "tin with a guilty expression on someone in the doorway.",
    "testpiloten": "A test hall with a rig shaking a metal chair violently on a vibrating platform. A test engineer sits on the chair being "
        "shaken, gripping a clipboard and laughing, while a colleague at an analog control desk turns a big dial up even further.",
  },
  "teknologerna": {
    "konstruktoren": "A design workshop with a big drafting table, large paper blueprints and a half-built strange machine in the background. "
        "The engineer has a pencil behind the ear and is measuring a part with a caliper, a scale model of the machine in the other hand; "
        "the real machine behind them is being lifted into place by a ceiling crane.",
    "automationsmastaren": "A workshop with an old industrial robot arm. The engineer patiently guides the robot arm by hand to teach it how to "
        "pour coffee into a mug; a colleague holds the mug at arm's length with a very sceptical face, a puddle on the floor from earlier "
        "attempts.",
    "kraftvavaren": "A huge electrical switch room with rows of old breaker cabinets and thick cables. A technician in insulated gloves turns a "
        "big main switch, and behind them, through an open doorway, an entire dark hall lights up lamp by lamp; colleagues cheer in "
        "silhouette.",
    "byggmastaren": "A new tunnel being dug out of rock inside the bunker with scaffolding and work lights. The construction engineer stands on "
        "the scaffolding holding a large rolled-out plan against the rock wall, comparing it with the real tunnel, while a small digger "
        "below waits with its bucket raised.",
    "energiomstallaren": "A tall shaft in the bunker where a large vintage wind turbine rotor turns in the air drawn down from the surface. "
        "The energy engineer hangs in a climbing harness next to the hub tightening a bolt, hair blown sideways by the wind, giving a "
        "thumbs-up to a colleague far below.",
    "formgivaren": "A design studio corner with prototypes of levers, knobs and buttons made of cardboard and foam. The designer watches an "
        "older colleague try a new foam lever for the first time, while sketching quickly on a pad; other failed prototypes are piled in "
        "a box labelled with a simple drawing of a thumbs-down.",
    "protesbyggaren": "A small orthopaedic workshop with plaster casts, tools and a 3D printer. The technician kneels and fits a newly built "
        "prosthetic leg on a person who is standing up from a chair and taking a first careful step, grinning; a colleague films it with "
        "an old camcorder.",
    "natvaktaren": "A dark server room with blinking lights and amber CRT terminals. The security technician sits with headphones on, very "
        "still, one finger hovering over a big red key; on the screen a tiny pixel figure is trying to sneak through a maze of lines. A "
        "colleague eats popcorn behind them, watching the screen.",
  },
}

def gen(job):
    valv, rid = job
    body = json.dumps({"model": "gpt-image-2", "prompt": stil(FARG[valv]) + ROLLER[valv][rid],
                       "size": "1536x1024", "quality": "high", "n": 1}).encode()
    req = urllib.request.Request("https://api.openai.com/v1/images/generations", data=body,
                                 headers={"Authorization": f"Bearer {KEY}", "Content-Type": "application/json"})
    try:
        r = json.load(urllib.request.urlopen(req, timeout=400))
    except Exception as e:
        return f"FEL {valv}/{rid}: {e}"
    ut = UT / valv
    ut.mkdir(parents=True, exist_ok=True)
    (ut / f"{rid}.png").write_bytes(base64.b64decode(r["data"][0]["b64_json"]))
    return f"klar: {valv}/{rid}"

args = [a for a in sys.argv[1:] if not a.startswith("--")]
om = "--om" in sys.argv
jobb = []
for valv, roller in ROLLER.items():
    for rid in roller:
        if args and valv not in args and f"{valv}/{rid}" not in args:
            continue
        if not om and (UT / valv / f"{rid}.png").exists():
            continue
        jobb.append((valv, rid))
print(f"{len(jobb)} bilder att generera", flush=True)
with ThreadPoolExecutor(5) as ex:
    for rad in ex.map(gen, jobb):
        print(rad, flush=True)
