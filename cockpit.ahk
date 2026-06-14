#Requires AutoHotkey v2.0
#SingleInstance Force

; ============================================================================
;  SCIENZA COCKPIT  —  numpad command centre
;  Danny / Absolute Aromas
;
;      ┌───────────┬───────────┬───────────┬───────────┐
;      │     /     │     *     │     -     │           │
;      │   Attio   │  Shopify  │  Apollo   │     +     │
;      │           │           │           │ next mon  │
;      ├───────────┼───────────┼───────────┼───────────┤
;      │     7     │     8     │     9     │           │
;      │  snap     │  snap     │  snap     │   Enter   │
;      │  LEFT ⅓   │ CENTRE ⅓  │  RIGHT ⅓  │ max toggle│
;      │           │^Muscle Mem│           │           │
;      ├───────────┼───────────┼───────────┤           │
;      │     4     │     5     │     6     │           │
;      │  Notion   │  Claude   │  Claude   │           │
;      │           │  desktop  │   web     │           │
;      ├───────────┼───────────┼───────────┼───────────┤
;      │     1     │     2     │     3     │           │
;      │  Scienza  │  Obsidian │  GitHub   │   dot     │
;      │           │           │           │ Relayout  │
;      ├───────────┴─────┬─────┴───────────┼───────────┤
;      │        0        │                 │           │
;      │    CLEANSE      │                 │           │
;      └─────────────────┴─────────────────┴───────────┘
;
;  CLEANSE (0): closes Attio, Shopify, Apollo, GitHub tabs and minimises
;               everything except Notion + Claude desktop — clean palette.
;  Relayout (dot): re-snaps hero windows back into their thirds.
; ============================================================================

SetNumLockState("AlwaysOn")
SetTitleMatchMode(2)
DetectHiddenWindows(false)

; ---------------------------------------------------------------------------
;  CONFIG
; ---------------------------------------------------------------------------

; Chrome executable path
global gChrome := "C:\Program Files\Google\Chrome\Application\chrome.exe"

; URLs to open in Chrome
global gURLs := Map(
    "attio"   , "https://app.attio.com",
    "shopify" , "https://admin.shopify.com",
    "apollo"  , "https://app.apollo.io",
    "github"  , "https://github.com",
    "claude"  , "https://claude.ai",
    "scienza"       , "https://8b9bf0b3.bubbles-elr.pages.dev/",
    "muscle-memory" , "https://one-all-over.dannytomlinson17.workers.dev/"
)

; Desktop app heroes
global gApps := Map(
    "claude-desktop", { match: "ahk_exe claude.exe",   run: "claude"   },
    "notion"        , { match: "ahk_exe Notion.exe",   run: "C:\Users\Danny\AppData\Local\Programs\Notion\Notion.exe" },
    "obsidian"      , { match: "ahk_exe Obsidian.exe", run: "obsidian" }
)

; Ultrawide thirds split (equal)
global gSplit := { l: 0.333, c: 0.334, r: 0.333 }

DetectMonitors()
global gMonUltra  := 0
global gMonLaptop := 0
FindMonitors()

; ===========================================================================
;  HOTKEYS
; ===========================================================================

; --- operator column: web apps ---
NumpadDiv::  OpenURL("attio")
NumpadMult:: OpenURL("shopify")
NumpadSub::  OpenURL("apollo")

; --- + and Enter: window ops ---
NumpadAdd::   MoveToNextMonitor()
NumpadEnter:: ToggleMax()

; --- top row: snap + Ctrl+8 opens Muscle Memory ---
Numpad7::  SnapActive("L")
Numpad8::  SnapActive("C")
Numpad9::  SnapActive("R")
^Numpad8:: OpenURL("muscle-memory")

; --- middle row: focus apps ---
Numpad4:: FocusApp("notion")
Numpad5:: FocusApp("claude-desktop")
Numpad6:: OpenURL("claude")

; --- bottom row: apps + GitHub ---
Numpad1:: OpenURL("scienza")
Numpad2:: FocusApp("obsidian")
Numpad3:: OpenURL("github")

; --- 0 and dot: rituals ---
Numpad0::   Cleanse()
NumpadDot:: Relayout()

; ===========================================================================
;  CORE FUNCTIONS
; ===========================================================================

FocusApp(name) {
    global gApps
    if !gApps.Has(name) {
        ShowToast(name " not found in config")
        return
    }
    h := gApps[name]
    if WinExist(h.match) {
        WinActivate(h.match)
        return
    }
    if (h.run != "")
        try Run(h.run)
    if WinWait(h.match, , 8)
        WinActivate(h.match)
    else
        ShowToast(name " didn't open — check the path in CONFIG")
}

OpenURL(name) {
    global gURLs, gChrome
    if !gURLs.Has(name) {
        ShowToast(name " URL not configured")
        return
    }
    url := gURLs[name]
    ; If Chrome is already open with this URL, focus it
    if WinExist(url) {
        WinActivate(url)
        return
    }
    ; Otherwise open it
    try Run(gChrome . ' "' . url . '"')
}

; ===========================================================================
;  SNAPPING
; ===========================================================================

SnapActive(zone) {
    global gMonUltra, gSplit
    s := gSplit
    hwnd := WinExist("A")
    if (!hwnd || !gMonUltra)
        return
    switch zone {
        case "L": SnapHwnd(hwnd, gMonUltra, 0,           0, s.l, 1)
        case "C": SnapHwnd(hwnd, gMonUltra, s.l,         0, s.c, 1)
        case "R": SnapHwnd(hwnd, gMonUltra, s.l + s.c,   0, s.r, 1)
    }
}

SnapHwnd(hwnd, mon, fx, fy, fw, fh) {
    if (!hwnd || !mon)
        return
    MonitorGetWorkArea(mon, &L, &T, &R, &B)
    w := R - L, h := B - T
    try {
        if (WinGetMinMax(hwnd) != 0)
            WinRestore(hwnd)
        WinMove(L + Round(w * fx), T + Round(h * fy), Round(w * fw), Round(h * fh), hwnd)
    }
}

; ===========================================================================
;  RITUALS
; ===========================================================================

Relayout() {
    ; Re-snaps the three hero desktop apps into their home thirds
    global gMonUltra, gSplit
    s := gSplit
    ShowToast("Relaying out...")
    
    ; Notion → left third
    if WinExist(gApps["notion"].match) {
        SnapHwnd(WinExist(gApps["notion"].match), gMonUltra, 0, 0, s.l, 1)
    }
    ; Claude desktop → centre third
    if WinExist(gApps["claude-desktop"].match) {
        SnapHwnd(WinExist(gApps["claude-desktop"].match), gMonUltra, s.l, 0, s.c, 1)
    }
    ; Claude web → right third (focuses if open)
    if WinExist("claude.ai") {
        SnapHwnd(WinExist("claude.ai"), gMonUltra, s.l + s.c, 0, s.r, 1)
    }
}

Cleanse() {
    ; Clean palette — minimise everything, leave only Notion + Claude desktop
    ShowToast("Cleansing...")
    
    ; Minimise all visible windows
    WinMinimizeAll()
    Sleep(300)
    
    ; Bring back Notion and Claude desktop only
    if WinExist(gApps["notion"].match)
        WinRestore(gApps["notion"].match)
    if WinExist(gApps["claude-desktop"].match)
        WinRestore(gApps["claude-desktop"].match)
    
    ; Snap them into place
    Sleep(200)
    Relayout()
    
    ; Focus Claude
    if WinExist(gApps["claude-desktop"].match)
        WinActivate(gApps["claude-desktop"].match)
}

; ===========================================================================
;  WINDOW OPS
; ===========================================================================

MoveToNextMonitor() {
    hwnd := WinExist("A")
    if !hwnd
        return
    WinGetPos(&x, &y, &w, &h, hwnd)
    cx := x + w // 2
    cy := y + h // 2
    count := MonitorGetCount()
    cur := 1
    Loop count {
        MonitorGet(A_Index, &L, &T, &R, &B)
        if (cx >= L && cx < R && cy >= T && cy < B) {
            cur := A_Index
            break
        }
    }
    next := Mod(cur, count) + 1
    MonitorGetWorkArea(next, &L, &T, &R, &B)
    try {
        if (WinGetMinMax(hwnd) != 0)
            WinRestore(hwnd)
        WinMove(L + 40, T + 40, Min(w, R - L), Min(h, B - T), hwnd)
    }
}

ToggleMax() {
    hwnd := WinExist("A")
    if !hwnd
        return
    if (WinGetMinMax(hwnd) = 1)
        WinRestore(hwnd)
    else
        WinMaximize(hwnd)
}

; ===========================================================================
;  MONITOR DETECTION
; ===========================================================================

DetectMonitors() {
    ; placeholder — called before FindMonitors is defined, safe to leave
}

FindMonitors() {
    global gMonUltra, gMonLaptop
    count := MonitorGetCount()
    primary := MonitorGetPrimary()
    ultra := 0, ultraW := 0
    Loop count {
        MonitorGet(A_Index, &L, &T, &R, &B)
        w := R - L, h := B - T
        if (h < w && w > ultraW) {
            ultraW := w
            ultra := A_Index
        }
    }
    gMonUltra := ultra ? ultra : primary
    ; Laptop is whichever landscape monitor isn't the ultrawide
    Loop count {
        if (A_Index != gMonUltra) {
            MonitorGet(A_Index, &L, &T, &R, &B)
            if ((R - L) >= (B - T)) {
                gMonLaptop := A_Index
                break
            }
        }
    }
    if (!gMonLaptop)
        gMonLaptop := gMonUltra
}

; ===========================================================================
;  UTIL
; ===========================================================================

ShowToast(msg) {
    ToolTip(msg)
    SetTimer(() => ToolTip(), -1800)
}
