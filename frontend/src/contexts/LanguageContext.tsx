import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'ta';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    brand_tagline: 'Fresh Chicken. Fresh Quality. Delivered to Your Door.',
    brand_sub: 'Order your favourite chicken cuts online, butchered fresh daily.',
    shop_now: 'Shop Fresh Cuts',
    explore_menu: 'Explore Chicken Cuts',
    categories: 'Chicken Categories',
    bestsellers: 'Bestselling Chicken Cuts',
    todays_offers: "Today's Fresh Offers",
    recommended: 'Recommended For You',
    why_us: 'Why Choose Meat Corner?',
    hygiene_title: '100% Farm-Fresh & Hygienic Standards',
    hygiene_sub: 'Zero antibiotics, zero chemical washes, freshly harvested and chilled under 4°C.',
    add_to_cart: 'Add to Cart',
    added: 'Added',
    out_of_stock: 'Out of Stock',
    delivering_to: 'Delivering to',
    search_placeholder: 'Search fresh curry cuts, breast boneless, drumsticks...',
    cart: 'Cart',
    checkout: 'Proceed to Checkout',
    total: 'Total Payable',
    subtotal: 'Subtotal',
    delivery_fee: 'Delivery Fee',
    free_delivery: 'FREE Delivery',
    my_orders: 'My Orders',
    track_order: 'Track Order',
    login_signup: 'Login / Register',
    admin_portal: 'Admin Portal',
    delivery_portal: 'Delivery Partner Portal',
    freshness_guarantee: '100% Farm Fresh Guarantee',
    express_delivery: 'Delivered in 30-45 mins'
  },
  ta: {
    brand_tagline: 'புதிய கோழி இறைச்சி. தரமான சுவை. உங்கள் இல்லத்திற்கு.',
    brand_sub: 'தினமும் பண்ணையிலிருந்து புதிதாக அறுக்கப்பட்ட கோழி இறைச்சி ஆன்லைனில் ஆர்டர் செய்யுங்கள்.',
    shop_now: 'இறைச்சி வாங்குக',
    explore_menu: 'கோழி வகைகள்',
    categories: 'கோழி இறைச்சி வகைகள்',
    bestsellers: 'அதிகம் விற்கப்படும் இறைச்சி',
    todays_offers: 'இன்றைய சிறப்புச் சலுகைகள்',
    recommended: 'பரிந்துரைக்கப்பட்டவை',
    why_us: 'மீட் கார்னரை ஏன் தேர்ந்தெடுக்க வேண்டும்?',
    hygiene_title: '100% ஹலால் சான்றிதழ் & பண்ணை தூய்மை தரம்',
    hygiene_sub: 'ரசாயனங்கள் இல்லாத, ஆண்டிபயாடிக் அற்ற, இயற்கையாக வளர்க்கப்பட்ட கோழிகள்.',
    add_to_cart: 'கூடையில் சேர்க்க',
    added: 'சேர்க்கப்பட்டது',
    out_of_stock: 'இருப்பு இல்லை',
    delivering_to: 'விநியோக இடம்',
    search_placeholder: 'கறிக்கட், எலும்பில்லாத கறி, லெக் பீஸ் தேடுக...',
    cart: 'கூடை',
    checkout: 'ஆர்டர் செய்ய தொடர்க',
    total: 'மொத்த கட்டணம்',
    subtotal: 'பொருட்கள் மதிப்பு',
    delivery_fee: 'டெலிவரி கட்டணம்',
    free_delivery: 'இலவச டெலிவரி',
    my_orders: 'எனது ஆர்டர்கள்',
    track_order: 'ஆர்டரைக் கண்காணிக்க',
    login_signup: 'உள்நுழைக / பதிவிட',
    admin_portal: 'நிர்வாக பக்கம்',
    delivery_portal: 'டெலிவரி பார்ட்னர் பக்கம்',
    freshness_guarantee: '100% புதிய பண்ணை உத்தரவாதம்',
    express_delivery: '30-45 நிமிடங்களில் டெலிவரி'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>((localStorage.getItem('meat_corner_lang') as Language) || 'en');

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('meat_corner_lang', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
