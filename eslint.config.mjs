<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" />

<style>
    /* ==========================================================================
   VARIABLES & THEME
   ========================================================================== */
    :root {
        --primary: #004b85;
        /* UFSCar Blue */
        --secondary: #9e1f31;
        /* UFSCar Red */
        --accent: #2e86de;
        --success: #10b981;
        --warning: #f59e0b;
        --danger: #ef4444;
        --dark: #1e293b;
        --light: #f8fafc;

        --glass-bg: rgba(255, 255, 255, 0.7);
        --glass-border: rgba(255, 255, 255, 0.5);
        --glass-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);

        --radius-lg: 16px;
        --radius-md: 12px;
        --radius-sm: 8px;
    }

    /* ==========================================================================
   ENHANCED SIDEBAR
   ========================================================================== */
    #wrapper {
        overflow-x: hidden;
        min-height: 100vh;
    }

    #sidebar-wrapper {
        min-height: 100vh;
        width: 16rem;
        margin-left: -16rem;
        transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        background: linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
        border-right: 1px solid rgba(255, 255, 255, 0.05);
        box-shadow: 4px 0 24px rgba(0, 0, 0, 0.3);
        display: flex;
        flex-direction: column;
    }

    #sidebar-wrapper .sidebar-heading {
        background: linear-gradient(135deg, rgba(0, 75, 133, 0.3) 0%, transparent 100%);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
        position: relative;
        overflow: hidden;
    }

    #sidebar-wrapper .sidebar-heading::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 200%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);
        animation: shimmer 3s infinite;
    }

    #sidebar-wrapper .list-group {
        width: 16rem;
        flex: 1;
    }

    #wrapper.toggled #sidebar-wrapper {
        margin-left: 0;
    }

    #page-content-wrapper {
        min-width: 100vw;
        transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    }

    #wrapper.toggled #page-content-wrapper {
        min-width: calc(100vw - 16rem);
        margin-left: 16rem;
    }

    @media (min-width: 768px) {
        #sidebar-wrapper {
            margin-left: 0;
        }

        #page-content-wrapper {
            min-width: 0;
            width: 100%;
        }

        #wrapper.toggled #sidebar-wrapper {
            margin-left: -16rem;
        }

        #wrapper.toggled #page-content-wrapper {
            min-width: 100%;
            margin-left: 0;
        }
    }

    /* Sidebar Navigation Items */
    .sidebar-nav-item {
        background: transparent !important;
        color: rgba(255, 255, 255, 0.7) !important;
        border: none !important;
        border-left: 3px solid transparent !important;
        padding: 1rem 1.25rem !important;
        transition: all 0.25s ease !important;
        position: relative;
        overflow: hidden;
    }

    .sidebar-nav-item::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 0;
        height: 100%;
        background: linear-gradient(90deg, rgba(0, 75, 133, 0.3), transparent);
        transition: width 0.3s ease;
    }

    .sidebar-nav-item:hover {
        background: rgba(255, 255, 255, 0.05) !important;
        color: #fff !important;
        border-left-color: var(--accent) !important;
        padding-left: 1.5rem !important;
    }

    .sidebar-nav-item:hover::before {
        width: 100%;
    }

    .sidebar-nav-item.active {
        background: rgba(0, 75, 133, 0.2) !important;
        color: #fff !important;
        border-left-color: var(--primary) !important;
    }

    .sidebar-nav-item .nav-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        margin-right: 0.75rem;
        font-size: 1.1rem;
        transition: transform 0.2s ease;
    }

    .sidebar-nav-item:hover .nav-icon {
        transform: scale(1.15);
    }

    /* Sidebar Section Titles */
    .sidebar-section-title {
        font-size: 0.65rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: rgba(255, 255, 255, 0.35);
        padding: 1.25rem 1.25rem 0.5rem;
        font-weight: 600;
    }

    /* Sidebar Footer */
    .sidebar-footer {
        background: rgba(0, 0, 0, 0.2);
        border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
        padding: 1.25rem !important;
    }

    /* Legacy Support */
    .list-group-item-dark {
        background-color: transparent !important;
        color: rgba(255, 255, 255, 0.7) !important;
        border-color: transparent !important;
    }

    .list-group-item-dark:hover {
        background-color: rgba(255, 255, 255, 0.05) !important;
        color: #fff !important;
    }

    /* Global Overrides */
    body {
        font-family: 'Outfit', sans-serif;
        background: #f8fafc;
        color: var(--dark);
        min-height: 100vh;
    }

    /* ==========================================================================
   GLASSMORPHISM COMPONENTS
   ========================================================================== */

    .glass-panel {
        background: var(--glass-bg);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid var(--glass-border);
        box-shadow: var(--glass-shadow);
        border-radius: var(--radius-lg);
    }

    .card {
        background: white;
        border: none;
        border-radius: var(--radius-lg);
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        overflow: hidden;
    }

    .card.hover-lift:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 12px -2px rgba(0, 0, 0, 0.1);
    }

    .card-header {
        background: transparent;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        padding: 1.25rem 1.5rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .card-body {
        padding: 1.5rem;
    }

    /* ==========================================================================
   NAVIGATION
   ========================================================================== */

    .navbar {
        background: rgba(0, 75, 133, 0.95) !important;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        padding: 1rem 0;
        position: relative;
        z-index: 1030;
        /* Above main content */
    }

    .navbar-brand {
        font-weight: 700;
        letter-spacing: -0.5px;
        font-size: 1.5rem;
    }

    .nav-link {
        font-weight: 500;
        padding: 0.5rem 1rem !important;
        border-radius: var(--radius-sm);
        transition: all 0.2s;
    }

    .nav-link:hover {
        background: rgba(255, 255, 255, 0.1);
    }

    /* User Info Badge */
    #user-info {
        background: rgba(255, 255, 255, 0.1);
        padding: 0.4rem 1rem;
        border-radius: var(--radius-md);
        margin-right: 1rem;
    }

    /* ==========================================================================
   BUTTONS & FORMS
   ========================================================================== */

    .btn {
        border-radius: var(--radius-sm);
        padding: 0.6rem 1.2rem;
        font-weight: 500;
        border: none;
        transition: all 0.2s;
    }

    .btn-primary {
        background: var(--primary);
        box-shadow: 0 4px 14px 0 rgba(0, 75, 133, 0.39);
    }

    .btn-primary:hover {
        background: #003d6e;
        transform: translateY(-1px);
    }

    .btn-secondary {
        background: #64748b;
    }

    .btn-success {
        background: var(--success);
        box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.39);
    }

    .btn-danger {
        background: var(--danger);
        box-shadow: 0 4px 14px 0 rgba(239, 68, 68, 0.39);
    }

    .form-control,
    .form-select {
        border-radius: var(--radius-sm);
        border: 1px solid #e2e8f0;
        padding: 0.75rem 1rem;
    }

    .form-control:focus,
    .form-select:focus {
        border-color: var(--accent);
        box-shadow: 0 0 0 3px rgba(46, 134, 222, 0.2);
    }

    /* ==========================================================================
   TABLES & BADGES
   ========================================================================== */

    .table {
        vertical-align: middle;
    }

    .table thead th {
        background: #f8fafc;
        text-transform: uppercase;
        font-size: 0.75rem;
        letter-spacing: 0.5px;
        color: #64748b;
        border: none;
        padding: 1rem;
    }

    .table td {
        padding: 1rem;
        border-color: #f1f5f9;
    }

    .status-badge {
        padding: 0.35em 0.8em;
        border-radius: 20px;
        font-size: 0.85em;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .status-Pendente {
        background: #fff7ed;
        color: #c2410c;
        border: 1px solid #ffedd5;
    }

    .status-Aprovado {
        background: #f0fdf4;
        color: #15803d;
        border: 1px solid #dcfce7;
    }

    .status-Rejeitado {
        background: #fef2f2;
        color: #b91c1c;
        border: 1px solid #fee2e2;
    }

    .status-Finalizado {
        background: #f1f5f9;
        color: #475569;
        border: 1px solid #e2e8f0;
    }

    /* ==========================================================================
   COMPONENTS
   ========================================================================== */

    /* Toast */
    .toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
    }

    .custom-toast {
        background: white;
        border-radius: var(--radius-md);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        padding: 1rem;
        margin-bottom: 0.75rem;
        display: flex;
        align-items: center;
        min-width: 300px;
        border-left: 4px solid var(--primary);
        opacity: 0;
        transform: translateX(100%);
        animation: slideIn 0.3s forwards;
    }

    .toast-success {
        border-left-color: var(--success);
    }

    .toast-error {
        border-left-color: var(--danger);
    }

    .toast-info {
        border-left-color: var(--accent);
    }

    @keyframes slideIn {
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    /* ==========================================================================
   PROFESSIONAL ANIMATIONS
   ========================================================================== */

    /* Entrance Animations */
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }

        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes fadeInDown {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }

        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes slideInLeft {
        from {
            opacity: 0;
            transform: translateX(-30px);
        }

        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(30px);
        }

        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes scaleIn {
        from {
            opacity: 0;
            transform: scale(0.9);
        }

        to {
            opacity: 1;
            transform: scale(1);
        }
    }

    @keyframes pulse {

        0%,
        100% {
            transform: scale(1);
        }

        50% {
            transform: scale(1.05);
        }
    }

    @keyframes shimmer {
        0% {
            background-position: -200% 0;
        }

        100% {
            background-position: 200% 0;
        }
    }

    @keyframes spin {
        from {
            transform: rotate(0deg);
        }

        to {
            transform: rotate(360deg);
        }
    }

    @keyframes bounce {

        0%,
        100% {
            transform: translateY(0);
        }

        50% {
            transform: translateY(-10px);
        }
    }

    /* Utility Classes */
    .animate-fadeInUp {
        animation: fadeInUp 0.4s ease-out forwards;
    }

    .animate-fadeInDown {
        animation: fadeInDown 0.4s ease-out forwards;
    }

    .animate-slideInLeft {
        animation: slideInLeft 0.4s ease-out forwards;
    }

    .animate-slideInRight {
        animation: slideInRight 0.4s ease-out forwards;
    }

    .animate-scaleIn {
        animation: scaleIn 0.3s ease-out forwards;
    }

    .animate-pulse {
        animation: pulse 0.6s ease-in-out;
    }

    .animate-bounce {
        animation: bounce 0.5s ease-in-out;
    }

    /* Staggered Animation Delays */
    .stagger-1 {
        animation-delay: 0.05s;
    }

    .stagger-2 {
        animation-delay: 0.1s;
    }

    .stagger-3 {
        animation-delay: 0.15s;
    }

    .stagger-4 {
        animation-delay: 0.2s;
    }

    .stagger-5 {
        animation-delay: 0.25s;
    }

    /* Skeleton Loading */
    .skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        border-radius: var(--radius-sm);
    }

    .skeleton-text {
        height: 1em;
        margin-bottom: 0.5em;
        border-radius: 4px;
    }

    .skeleton-card {
        height: 120px;
        border-radius: var(--radius-md);
    }

    /* Enhanced Transitions */
    * {
        transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
        transition-duration: 0.15s;
        transition-timing-function: ease-out;
    }

    /* Interactive Element Hover Effects */
    .clickable {
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .clickable:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.15);
    }

    .clickable:active {
        transform: translateY(-1px);
        box-shadow: 0 6px 12px -4px rgba(0, 0, 0, 0.1);
    }

    /* Button Ripple Effect */
    .btn {
        position: relative;
        overflow: hidden;
    }

    .btn::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        transition: width 0.4s ease, height 0.4s ease;
    }

    .btn:active::after {
        width: 300px;
        height: 300px;
    }

    /* Card Hover Enhancements */
    .card {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .card:hover {
        transform: translateY(-6px);
        box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.1);
    }

    /* Badge Animation on Role Switch */
    .badge-animate {
        animation: scaleIn 0.3s ease-out, pulse 0.6s ease-in-out 0.3s;
    }

    /* Page Transition */
    .page-enter {
        opacity: 0;
        transform: translateY(10px);
    }

    .page-enter-active {
        opacity: 1;
        transform: translateY(0);
        transition: opacity 0.3s ease, transform 0.3s ease;
    }

    .page-exit {
        opacity: 1;
    }

    .page-exit-active {
        opacity: 0;
        transition: opacity 0.2s ease;
    }

    /* Loading Overlay */
    #loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9999;
        background: linear-gradient(135deg, rgba(0, 75, 133, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%);
        backdrop-filter: blur(10px);
        display: none;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }

    #loading-overlay .spinner-border {
        width: 3.5rem;
        height: 3.5rem;
        border-width: 0.3rem;
        color: #fff;
        animation: spin 1s linear infinite;
    }

    #loading-overlay .loading-text {
        color: rgba(255, 255, 255, 0.9);
        font-size: 1.1rem;
        font-weight: 500;
        margin-top: 1.5rem;
        animation: pulse 1.5s ease-in-out infinite;
    }

    /* Section Transitions */
    .view-section {
        animation: fadeInUp 0.4s ease-out;
    }

    /* Modal Animations */
    .modal.fade .modal-dialog {
        transform: scale(0.95) translateY(-20px);
        transition: transform 0.3s ease-out;
    }

    .modal.show .modal-dialog {
        transform: scale(1) translateY(0);
    }

    /* Form Input Focus Effects */
    .form-control:focus,
    .form-select:focus {
        border-color: var(--accent);
        box-shadow: 0 0 0 4px rgba(46, 134, 222, 0.15);
        transform: scale(1.01);
    }

    /* Toast Animations */
    .custom-toast {
        animation: slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    .toast-exit {
        animation: slideOutRight 0.3s ease-in forwards;
    }

    @keyframes slideOutRight {
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }

    /* Responsive Fluid Layout */
    html {
        scroll-behavior: smooth;
    }

    .container-fluid {
        max-width: 1600px;
        margin: 0 auto;
    }

    /* Mobile Optimizations */
    @media (max-width: 768px) {
        .card:hover {
            transform: none;
        }

        .clickable:hover {
            transform: none;
        }

        .view-section {
            animation: fadeIn 0.3s ease-out;
        }
    }

    /* ==========================================================================
       SECRETARIA DASHBOARD STYLES
       ========================================================================== */

    .sec-stat-card {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border-left: 4px solid transparent;
    }

    .sec-stat-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.15) !important;
    }

    .sec-stat-card:nth-child(1) .card {
        border-left-color: var(--warning);
    }

    .sec-stat-card:nth-child(2) .card {
        border-left-color: var(--accent);
    }

    .sec-stat-card:nth-child(3) .card {
        border-left-color: var(--success);
    }

    .sec-stat-card:nth-child(4) .card {
        border-left-color: var(--primary);
    }

    /* Status Colors for Kanban */
    .status-warning {
        border-left: 4px solid #f59e0b !important;
    }

    .status-info {
        border-left: 4px solid #0dcaf0 !important;
    }

    .status-success {
        border-left: 4px solid #10b981 !important;
    }

    .status-danger {
        border-left: 4px solid #ef4444 !important;
    }

    .status-secondary {
        border-left: 4px solid #64748b !important;
    }

    /* Quick Action Buttons Hover */
    .btn-outline-primary:hover,
    .btn-outline-warning:hover,
    .btn-outline-success:hover,
    .btn-outline-info:hover {
        transform: translateY(-2px);
    }

    /* Pending Actions List */
    .list-group-item {
        transition: background-color 0.2s ease;
    }

    .list-group-item:hover {
        background-color: rgba(0, 75, 133, 0.05) !important;
    }

    /* ==========================================================================
       STUDENT DASHBOARD - CATEGORY CARDS
       ========================================================================== */

    .category-card {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .category-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.2) !important;
    }

    .category-card:hover .fs-1 {
        transform: scale(1.1);
    }

    .category-card .fs-1 {
        transition: transform 0.3s ease;
    }

    /* Kanban adjustments */
    .kanban-body {
        max-height: 400px;
        overflow-y: auto;
    }

    /* Student Request Cards */
    .student-request-card {
        transition: all 0.3s ease;
        border-left: 4px solid transparent !important;
    }

    .student-request-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.15) !important;
        border-left-color: var(--primary) !important;
    }

    .student-request-card .badge {
        font-size: 0.75rem;
    }

    /* Custom Purple Theme for Em Pauta */
    .bg-purple {
        background-color: #6f42c1 !important;
        color: white;
    }

    .text-purple {
        color: #6f42c1 !important;
    }

    .btn-purple {
        background-color: #6f42c1;
        color: white;
        border-color: #6f42c1;
    }

    .btn-purple:hover {
        background-color: #59359a;
        color: white;
    }

    .btn-outline-purple {
        color: #6f42c1;
        border-color: #6f42c1;
    }

    .btn-outline-purple:hover {
        background-color: #6f42c1;
        color: white;
    }

    /* ==========================================================================
       BADGE CONTRAST FIXES
       ========================================================================== */
    /* Ensure readable text on light-colored badges */
    .badge.bg-warning,
    .badge.bg-info,
    .badge.bg-light {
        color: #212529 !important;
    }

    /* Fix for badges with opacity modifications */
    .badge.bg-success.bg-opacity-75 {
        color: #fff !important;
    }
</style>