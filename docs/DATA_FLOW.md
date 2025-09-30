# Data Flow Diagrams
## Standard Notes Enhanced Editor

---

## 1. SYSTEM ARCHITECTURE OVERVIEW

```mermaid
graph TB
    subgraph "Standard Notes App"
        SN[Standard Notes Core]
        CR[ComponentRelay API]
    end

    subgraph "Enhanced Editor"
        EC[EditorCore]
        PM[PluginManager]
        SM[StorageManager]
        UI[UI Components]

        subgraph "Plugins"
            MP[Mermaid Plugin]
            EP[Excalidraw Plugin]
        end
    end

    SN <-->|Events| CR
    CR <-->|Save/Load| EC
    EC --> PM
    EC --> SM
    EC --> UI
    PM -.->|Lazy Load| MP
    PM -.->|Lazy Load| EP
    SM --> EC
    UI -->|User Actions| EC

    style SN fill:#e1f5ff
    style EC fill:#ffe1e1
    style MP fill:#fff4e1
    style EP fill:#fff4e1
```

---

## 2. INITIALIZATION FLOW

```mermaid
sequenceDiagram
    participant SN as Standard Notes
    participant CR as ComponentRelay
    participant EC as EditorCore
    participant PM as PluginManager
    participant UI as UI Components

    SN->>CR: Load Extension
    CR->>EC: Initialize()
    EC->>PM: Initialize()
    EC->>UI: Render Mode Selector

    alt Has Saved Data
        CR->>EC: Load Note Data
        EC->>EC: Parse & Validate Data
        EC->>PM: Get Plugin for Mode
        PM->>EC: Return Plugin Instance
        EC->>UI: Render Active Plugin
    else No Saved Data
        EC->>UI: Show Default Mode
    end

    UI->>SN: Ready Event
```

---

## 3. MODE SWITCHING FLOW

```mermaid
stateDiagram-v2
    [*] --> TextMode

    TextMode --> MermaidMode: User selects Mermaid
    TextMode --> ExcalidrawMode: User selects Excalidraw

    MermaidMode --> TextMode: User selects Text
    MermaidMode --> ExcalidrawMode: User selects Excalidraw

    ExcalidrawMode --> TextMode: User selects Text
    ExcalidrawMode --> MermaidMode: User selects Mermaid

    state TextMode {
        [*] --> Editing
        Editing --> Saving
        Saving --> Editing
    }

    state MermaidMode {
        [*] --> LoadPlugin
        LoadPlugin --> Rendering
        Rendering --> LivePreview
        LivePreview --> Saving
        Saving --> LivePreview
    }

    state ExcalidrawMode {
        [*] --> LoadPlugin
        LoadPlugin --> Drawing
        Drawing --> Saving
        Saving --> Drawing
    }
```

---

## 4. DATA PERSISTENCE FLOW

```mermaid
sequenceDiagram
    participant User
    participant Plugin as Active Plugin
    participant EC as EditorCore
    participant SM as StorageManager
    participant CR as ComponentRelay
    participant SN as Standard Notes

    User->>Plugin: Edit Content
    Plugin->>EC: Content Changed Event
    EC->>EC: Debounce (500ms)
    EC->>SM: Prepare Data for Save
    SM->>SM: Validate Data
    SM->>SM: Serialize Data
    SM->>CR: Save Note Data
    CR->>SN: Sync to Storage
    SN-->>CR: Save Confirmed
    CR-->>EC: Save Success
    EC->>User: Show Save Indicator
```

---

## 5. PLUGIN LIFECYCLE

```mermaid
flowchart TD
    Start([User Switches Mode]) --> Check{Plugin Loaded?}

    Check -->|Yes| Reuse[Use Existing Instance]
    Check -->|No| Load[Load Plugin Bundle]

    Load --> Init[Initialize Plugin]
    Init --> Setup[Setup Event Listeners]
    Setup --> Render[Render Plugin UI]

    Reuse --> Restore[Restore Plugin State]
    Restore --> Render

    Render --> Active[Plugin Active]

    Active --> Switch{User Switches Mode?}
    Switch -->|Yes| Save[Save Current State]
    Switch -->|No| Active

    Save --> Cleanup[Cleanup Event Listeners]
    Cleanup --> Keep{Keep Plugin Loaded?}

    Keep -->|Yes| Idle[Plugin Idle]
    Keep -->|No| Destroy[Destroy Plugin Instance]

    Idle --> End([End])
    Destroy --> End
```

---

## 6. ERROR HANDLING FLOW

```mermaid
graph TD
    Error[Error Occurs] --> Classify{Error Type?}

    Classify -->|Plugin Load| LoadError[Plugin Load Error]
    Classify -->|Render| RenderError[Render Error]
    Classify -->|Data| DataError[Data Validation Error]
    Classify -->|Network| NetworkError[Network Error]

    LoadError --> Log1[Log Error]
    RenderError --> Log2[Log Error]
    DataError --> Log3[Log Error]
    NetworkError --> Log4[Log Error]

    Log1 --> Notify1[Show User Notification]
    Log2 --> Notify2[Show Error Boundary]
    Log3 --> Notify3[Show Warning]
    Log4 --> Notify4[Show Retry Option]

    Notify1 --> Fallback1[Fallback to Text Mode]
    Notify2 --> Fallback2[Preserve Data]
    Notify3 --> Attempt[Attempt Recovery]
    Notify4 --> Retry{Retry?}

    Retry -->|Yes| RetryAction[Retry Operation]
    Retry -->|No| Fallback3[Fallback Mode]

    Fallback1 --> Report[Report to Telemetry]
    Fallback2 --> Report
    Attempt --> Report
    Fallback3 --> Report
    RetryAction --> Report

    Report --> End([End])
```

---

## 7. MERMAID PLUGIN DATA FLOW

```mermaid
sequenceDiagram
    participant User
    participant Editor as Mermaid Editor
    participant Val as Syntax Validator
    participant Render as Mermaid Renderer
    participant EC as EditorCore

    User->>Editor: Type Mermaid Code
    Editor->>Val: Validate Syntax

    alt Valid Syntax
        Val->>Render: Parse & Render
        Render->>Render: Generate SVG
        Render->>Editor: Display Diagram
        Editor->>EC: Content Changed
    else Invalid Syntax
        Val->>Editor: Show Error Highlight
        Editor->>User: Display Error Message
    end

    loop Auto-Save
        EC->>EC: Debounce (500ms)
        EC->>EC: Save to Standard Notes
    end
```

---

## 8. EXCALIDRAW PLUGIN DATA FLOW

```mermaid
sequenceDiagram
    participant User
    participant EX as Excalidraw Component
    participant Scene as Scene Manager
    participant EC as EditorCore

    User->>EX: Draw on Canvas
    EX->>Scene: Update Scene Elements
    Scene->>Scene: Calculate Bounds
    Scene->>EC: Scene Changed Event

    loop Auto-Save
        EC->>EC: Debounce (500ms)
        EC->>Scene: Get Scene Data
        Scene->>EC: Return Elements Array
        EC->>EC: Serialize & Save
    end

    Note over User,EC: User switches away
    EC->>Scene: Get Final Scene
    Scene->>EC: Complete Scene Data
    EC->>EC: Save to Standard Notes
```

---

## 9. BUILD & DEPLOYMENT FLOW

```mermaid
flowchart LR
    subgraph Development
        Code[Write Code] --> Test[Run Tests]
        Test --> Lint[Lint & Format]
    end

    subgraph Build
        Lint --> Webpack[Webpack Build]
        Webpack --> Split[Code Splitting]
        Split --> Minify[Minify & Optimize]
    end

    subgraph Quality
        Minify --> Unit[Unit Tests]
        Unit --> Integration[Integration Tests]
        Integration --> E2E[E2E Tests]
    end

    subgraph Deploy
        E2E --> Package[Create Package]
        Package --> Git[Push to GitHub]
        Git --> Action[GitHub Action]
        Action --> CF[Deploy to Cloudflare]
        CF --> CDN[CDN Distribution]
    end

    style Development fill:#e1f5ff
    style Build fill:#ffe1e1
    style Quality fill:#fff4e1
    style Deploy fill:#e1ffe1
```

---

## 10. USER JOURNEY - CREATE MERMAID DIAGRAM

```mermaid
journey
    title Creating a Mermaid Diagram in Standard Notes
    section Open Note
        Open Standard Notes: 5: User
        Create new note: 5: User
        Select Enhanced Editor: 5: User
    section Switch to Mermaid
        Click Mermaid mode: 5: User
        Wait for plugin load: 3: System
        See editor interface: 5: User
    section Create Diagram
        Type Mermaid syntax: 4: User
        See live preview: 5: User
        Fix syntax errors: 3: User
        Iterate on design: 4: User
    section Save & Share
        Auto-save triggers: 5: System
        Close note: 5: User
        Reopen note: 5: User
        See rendered diagram: 5: User
```

---

## 11. DATA STRUCTURE FLOW

```mermaid
classDiagram
    class EditorData {
        +string mode
        +ContentData content
        +MetaData metadata
        +validate()
        +serialize()
    }

    class ContentData {
        <<interface>>
        +toJSON()
        +fromJSON()
    }

    class TextContent {
        +string text
        +toJSON()
        +fromJSON()
    }

    class MermaidContent {
        +string code
        +string diagramType
        +ValidationResult validation
        +toJSON()
        +fromJSON()
    }

    class ExcalidrawContent {
        +ExcalidrawElement[] elements
        +AppState appState
        +toJSON()
        +fromJSON()
    }

    class MetaData {
        +string version
        +string lastMode
        +number created
        +number modified
        +toJSON()
    }

    EditorData --> ContentData
    ContentData <|-- TextContent
    ContentData <|-- MermaidContent
    ContentData <|-- ExcalidrawContent
    EditorData --> MetaData
```

---

## 12. PERFORMANCE OPTIMIZATION FLOW

```mermaid
graph TD
    Request[User Action] --> Check{Bundle Loaded?}

    Check -->|Yes| Instant[Instant Response]
    Check -->|No| Lazy[Lazy Load Bundle]

    Lazy --> Cache{In Cache?}
    Cache -->|Yes| FastLoad[Load from Cache]
    Cache -->|No| Download[Download from CDN]

    Download --> Store[Store in Cache]
    FastLoad --> Init
    Store --> Init[Initialize Plugin]

    Init --> Render[Render UI]
    Instant --> Render

    Render --> Optimize{Heavy Operation?}

    Optimize -->|Yes| Worker[Use Web Worker]
    Optimize -->|No| Direct[Direct Render]

    Worker --> Result[Return Result]
    Direct --> Result

    Result --> Memoize[Memoize if Needed]
    Memoize --> Display[Display to User]

    Display --> Measure[Measure Performance]
    Measure --> End([End])
```

---

**Document Owner:** Mike Schlottig
**Last Updated:** 2025-09-29