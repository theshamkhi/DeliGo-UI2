import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ColisStatut, ColisPriorite } from '../types';

export const formatDate = (dateString: string, formatString = 'dd/MM/yyyy'): string => {
    try {
        return format(parseISO(dateString), formatString, { locale: fr });
    } catch {
        return dateString;
    }
};

export const formatDateTime = (dateString: string): string => {
    return formatDate(dateString, 'dd/MM/yyyy HH:mm');
};

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: 'MAD',
    }).format(amount);
};

export const formatWeight = (weight: number): string => {
    return `${weight.toFixed(2)} kg`;
};

export const getStatutLabel = (statut: ColisStatut): string => {
    const labels: Record<ColisStatut, string> = {
        [ColisStatut.CREE]: 'Créé',
        [ColisStatut.COLLECTE]: 'Collecté',
        [ColisStatut.EN_STOCK]: 'En stock',
        [ColisStatut.EN_TRANSIT]: 'En transit',
        [ColisStatut.LIVRE]: 'Livré',
        [ColisStatut.ANNULE]: 'Annulé',
        [ColisStatut.RETOURNE]: 'Retourné',
    };
    return labels[statut] || statut;
};

export const getStatutColor = (statut: ColisStatut): string => {
    const colors: Record<ColisStatut, string> = {
        [ColisStatut.CREE]: '#6B7280',
        [ColisStatut.COLLECTE]: '#3B82F6',
        [ColisStatut.EN_STOCK]: '#F59E0B',
        [ColisStatut.EN_TRANSIT]: '#8B5CF6',
        [ColisStatut.LIVRE]: '#10B981',
        [ColisStatut.ANNULE]: '#EF4444',
        [ColisStatut.RETOURNE]: '#F97316',
    };
    return colors[statut] || '#6B7280';
};

export const getPrioriteLabel = (priorite: ColisPriorite): string => {
    const labels: Record<ColisPriorite, string> = {
        [ColisPriorite.NORMALE]: 'Normale',
        [ColisPriorite.HAUTE]: 'Haute',
        [ColisPriorite.URGENTE]: 'Urgente',
    };
    return labels[priorite] || priorite;
};

export const getPrioriteColor = (priorite: ColisPriorite): string => {
    const colors: Record<ColisPriorite, string> = {
        [ColisPriorite.NORMALE]: '#6B7280',
        [ColisPriorite.HAUTE]: '#F59E0B',
        [ColisPriorite.URGENTE]: '#EF4444',
    };
    return colors[priorite] || '#6B7280';
};

export const truncate = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
};

export const capitalizeFirst = (text: string): string => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const getInitials = (nom: string, prenom: string): string => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
};