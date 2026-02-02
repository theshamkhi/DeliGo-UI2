export enum UserRole {
    MANAGER = 'ROLE_MANAGER',
    LIVREUR = 'ROLE_LIVREUR',
    CLIENT = 'ROLE_CLIENT',
    DESTINATAIRE = 'ROLE_DESTINATAIRE'
}

export enum ColisStatut {
    CREE = 'CREE',
    COLLECTE = 'COLLECTE',
    EN_STOCK = 'EN_STOCK',
    EN_TRANSIT = 'EN_TRANSIT',
    LIVRE = 'LIVRE',
    ANNULE = 'ANNULE',
    RETOURNE = 'RETOURNE'
}

export enum ColisPriorite {
    NORMALE = 'NORMALE',
    HAUTE = 'HAUTE',
    URGENTE = 'URGENTE'
}

export interface User {
    id: string;
    username: string;
    email: string;
    nom: string;
    prenom: string;
    roles: UserRole[];
    permissions: string[];
    livreurId?: string;
    clientExpediteurId?: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    type: string;
    id: string;
    username: string;
    email: string;
    nom: string;
    prenom: string;
    roles: UserRole[];
    permissions: string[];
    livreurId?: string;
    clientExpediteurId?: string;
}

export interface HistoriqueLivraison {
    id: string;
    colisId: string;
    ancienStatut: ColisStatut;
    nouveauStatut: ColisStatut;
    commentaire?: string;
    dateChangement: string;
    modifiePar?: string;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterData {
    username: string;
    password: string;
    email: string;
    nom: string;
    prenom: string;
    telephone?: string;
    roleNames: string[];
}

export interface Colis {
    id: string;
    description: string;
    poids: number;
    priorite: ColisPriorite;
    statut: ColisStatut;
    clientExpediteurId: string;
    destinataireId: string;
    livreurId?: string;
    villeDestination: string;
    dateCreation: string;
    dateModification: string;
    dateLimiteLivraison?: string;
    commentaire?: string;
}

export interface CreateColisData {
    description: string;
    poids: number;
    priorite: ColisPriorite;
    clientExpediteurId: string;
    destinataireId: string;
    villeDestination: string;
    dateLimiteLivraison?: string;
    commentaire?: string;
}

export interface UpdateColisData extends CreateColisData {
    livreurId?: string;
}

export interface UpdateColisStatusData {
    statut: ColisStatut;
    commentaire?: string;
}

export interface Client {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    adresse: string;
    dateCreation?: string;
}

export interface CreateClientData {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    adresse: string;
}

export interface Destinataire {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    adresse: string;
}

export interface CreateDestinataireData {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    adresse: string;
}

export interface Livreur {
    id: string;
    nom: string;
    prenom: string;
    telephone: string;
    vehicule: string;
    zoneAssigneeId?: string;
    actif: boolean;
}

export interface CreateLivreurData {
    nom: string;
    prenom: string;
    telephone: string;
    vehicule: string;
    zoneAssigneeId?: string;
    actif: boolean;
}

export interface Zone {
    id: string;
    nom: string;
    ville: string;
    codePostal: string;
}

export interface CreateZoneData {
    nom: string;
    ville: string;
    codePostal: string;
}

export interface ColisStatistics {
    total: number;
    cree: number;
    collecte: number;
    enStock: number;
    enTransit: number;
    livre: number;
    annule: number;
    retourne: number;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

export interface ApiError {
    message: string;
    status?: number;
    errors?: Record<string, string[]>;
}