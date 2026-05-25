import React from 'react';
import { useRouter } from '../contexts/RouterContext';
import { useTranslation } from 'react-i18next';

export default function Breadcrumbs() {
    const { route, navigate } = useRouter();
    const { t } = useTranslation();

    if (route.page === 'home') return null;

    const getBreadcrumbs = () => {
        const crumbs = [
            { label: t('home'), page: 'home' }
        ];

        switch (route.page) {
            case 'browse':
                crumbs.push({ label: t('browseProducts'), page: 'browse' });
                break;
            case 'category':
                crumbs.push({ label: t('browseProducts'), page: 'browse' });
                crumbs.push({ label: t('category'), page: 'category', params: route.params });
                break;
            case 'product':
                crumbs.push({ label: t('browseProducts'), page: 'browse' });
                crumbs.push({ label: t('product'), page: 'product', params: route.params });
                break;
            case 'search':
                crumbs.push({ label: t('search'), page: 'search' });
                break;
            case 'cart':
                crumbs.push({ label: t('cart'), page: 'cart' });
                break;
            case 'checkout':
                crumbs.push({ label: t('cart'), page: 'cart' });
                crumbs.push({ label: t('checkout'), page: 'checkout' });
                break;
            case 'profile':
                crumbs.push({ label: t('myProfile'), page: 'profile' });
                break;
            case 'admin':
                crumbs.push({ label: t('adminPanel'), page: 'admin' });
                break;
            default:
                crumbs.push({ label: t(route.page) || route.page, page: route.page });
        }

        return crumbs;
    };

    const crumbs = getBreadcrumbs();

    return (
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center text-sm font-medium text-gray-500 whitespace-nowrap overflow-x-auto no-scrollbar">
            {crumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                    {index > 0 && (
                        <svg className="flex-shrink-0 mx-3 h-4 w-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                    )}
                    <button
                        onClick={() => navigate(crumb.page, crumb.params || {})}
                        className={`hover:text-gold-500 transition-colors ${index === crumbs.length - 1 ? 'text-gold-500 font-bold' : ''}`}
                    >
                        {crumb.label}
                    </button>
                </React.Fragment>
            ))}
        </nav>
    );
}
