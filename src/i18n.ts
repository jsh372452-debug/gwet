import { useAuthStore } from './store/authStore';

const translations = {
    en: {
        welcome: 'Welcome back',
        identity: 'USERNAME',
        security: 'PASSWORD',
        access: 'ACCESS',
        register: 'REGISTER',
        login: 'LOGIN',
        network: 'FEED',
        comms: 'CHAT',
        squads: 'SQUADS',
        settings: 'SETTINGS',
        logout: 'LOGOUT',
        search: 'Search...',
        share: 'Share your latest gaming moment...',
        gweet: 'POST',
        online: 'ONLINE',
        encrypted: 'ENCRYPTED',
        country: 'COUNTRY',
        language: 'LANGUAGE',
        onboarding: 'SET UP YOUR PROFILE',
        display_name: 'DISPLAY NAME',
        select_class: 'SELECT CLASS',
        save: 'SAVE',
        admin: 'ADMIN',
        kick: 'KICK',
        theme: 'THEME COLOR',
        banner: 'BANNER',
        members: 'MEMBERS',
        wow: 'WOW',
        comment: 'Write a comment...',
        comments: 'COMMENTS',
        private_chat: 'DIRECT MESSAGE',
        groups: 'GROUPS',
        joined: 'MY HUB',
        create_group: 'NEW GROUP',
        group_name: 'GROUP NAME',
        group_desc: 'DESCRIPTION',
        back: 'BACK',
        explore: 'EXPLORE',
        latest: 'LATEST',
        popular: 'POPULAR',
        by_game: 'BY GAME'
    },
    ar: {
        welcome: 'أهلاً بك',
        identity: 'اسم المستخدم',
        security: 'كلمة المرور',
        access: 'دخول',
        register: 'إنشاء حساب',
        login: 'تسجيل دخول',
        network: 'المنشورات',
        comms: 'المحادثات',
        squads: 'الفرق',
        settings: 'الإعدادات',
        logout: 'خروج',
        search: 'بحث...',
        share: 'شارك لحظتك الأخيرة...',
        gweet: 'نشر',
        online: 'متصل',
        encrypted: 'مشفر',
        country: 'الدولة',
        language: 'اللغة',
        onboarding: 'إعداد الملف الشخصي',
        display_name: 'الاسم المعروض',
        select_class: 'اختر الفئة',
        save: 'حفظ',
        admin: 'الإدارة',
        kick: 'طرد',
        theme: 'اللون',
        banner: 'الغلاف',
        members: 'الأعضاء',
        wow: 'واو',
        comment: 'اكتب تعليقاً...',
        comments: 'التعليقات',
        private_chat: 'رسالة خاصة',
        groups: 'المجموعات',
        joined: 'شبكتي',
        create_group: 'مجموعة جديدة',
        group_name: 'اسم المجموعة',
        group_desc: 'الوصف',
        back: 'رجوع',
        explore: 'استكشاف',
        latest: 'الأحدث',
        popular: 'الأكثر تفاعلاً',
        by_game: 'حسب اللعبة'
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
