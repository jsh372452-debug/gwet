import { useAuthStore } from './store/authStore';

const translations = {
    en: {
        welcome: 'Welcome back, Agent',
        identity: 'IDENTITY TOKEN',
        security: 'SECURITY KEY',
        access: 'ACCESS VAULT',
        register: 'REGISTER',
        login: 'LOGIN',
        network: 'NETWORK FEED',
        comms: 'GLOBAL COMMS',
        squads: 'SQUADS',
        settings: 'SETTINGS',
        logout: 'LOGOUT',
        search: 'Search Network...',
        share: 'Share your latest gaming feat...',
        gweet: 'GWEET',
        online: 'ONLINE',
        encrypted: 'END-TO-END ENCRYPTED',
        country: 'COUNTRY / ORIGIN',
        language: 'INTERFACE LANGUAGE',
        onboarding: 'INITIALIZE IDENTITY',
        display_name: 'DISPLAY NAME',
        select_class: 'SELECT CLASS',
        save: 'SAVE IDENTITY',
        admin: 'ADMIN PANEL',
        kick: 'KICK AGENT',
        theme: 'COMMUNITY THEME',
        banner: 'UPLOAD BANNER',
        members: 'TACTICIANS',
        wow: 'WOW',
        comment: 'COMMENT',
        comments: 'INTEL LOGS',
        private_chat: 'SECURE DIRECT',
        groups: 'OPERATIONAL GROUPS',
        joined: 'MY NETWORK',
        create_group: 'NEW GROUP',
        group_name: 'GROUP DESIGNATION',
        group_desc: 'GROUP OBJECTIVE',
        back: 'BACK TO HUB'
    },
    ar: {
        welcome: 'أهلاً بك أيها العميل',
        identity: 'رمز الهوية (اسم المستخدم)',
        security: 'مفتاح الأمان (كلمة المرور)',
        access: 'دخول الخزنة',
        register: 'إنشاء هوية',
        login: 'تسجيل دخول',
        network: 'شبكة الأخبار',
        comms: 'الاتصالات العامة',
        squads: 'المجتمعات',
        settings: 'الإعدادات',
        logout: 'تسجيل خروج',
        search: 'بحث في الشبكة...',
        share: 'شارك إنجازك الأخير...',
        gweet: 'نشر (GWEET)',
        online: 'متصل',
        encrypted: 'تشفير تام بين الطرفين',
        country: 'الدولة / المنشأ',
        language: 'لغة الواجهة',
        onboarding: 'تهيئة الهوية الرقمية',
        display_name: 'الاسم المستعار',
        select_class: 'اختر الفئة (Class)',
        save: 'حفظ الهوية',
        admin: 'لوحة التحكم',
        kick: 'طرد العميل',
        theme: 'سمة المجتمع (Theme)',
        banner: 'رفع غلاف للمجتمع',
        members: 'الأعضاء',
        wow: 'واو (WOW)',
        comment: 'تعليق',
        comments: 'سجل المعلومات',
        private_chat: 'مراسلة خاصة',
        groups: 'مجموعات العمليات',
        joined: 'شبكتي الخاصة',
        create_group: 'مجموعة جديدة',
        group_name: 'اسم المجموعة',
        group_desc: 'هدف المجموعة',
        back: 'العودة للمركز'
    }
};

export const useTranslation = () => {
    const { user } = useAuthStore();
    const lang = user?.language || 'en';

    const t = (key: keyof typeof translations['en']) => {
        return translations[lang][key] || translations['en'][key];
    };

    const isRTL = lang === 'ar';

    return { t, isRTL, lang };
};
