// ============================================
// User & Authentication Types
// ============================================

export enum UserRole {
    MANAGER = 'ROLE_MANAGER',
    LIVREUR = 'ROLE_LIVREUR',
    CLIENT = 'ROLE_CLIENT',
    DESTINATAIRE = 'ROLE_DESTINATAIRE'
}

export interface User {
    id: string;
    username: string;
    email: string;
    nom: string;
    prenom: string;
    telephone?: string;
    roles: UserRole[];
    permissions: string[];
    livreurId?: string;
    clientExpediteurId?: string;
    actif?: boolean;
    dateCreation?: string;
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

export interface LoginCredentials {
    username: string;
    password: string;
}

// ============================================
// Unified Registration (NEW - Simplified!)
// ============================================

/**
 * Nested data for creating a Livreur entity
 * Required when roles includes ROLE_LIVREUR
 */
export interface LivreurCreationData {
    vehicule: string;
    zoneAssigneeId?: string;
    actif?: boolean;
}

/**
 * Nested data for creating a Client entity
 * Required when roles includes ROLE_CLIENT
 */
export interface ClientCreationData {
    adresse: string;
}

/**
 * Unified registration request - works for ALL user types
 * Use this single interface for creating ANY user:
 * - ROLE_MANAGER (no nested data needed)
 * - ROLE_LIVREUR (requires livreurData)
 * - ROLE_CLIENT (requires clientData)
 */
export interface RegisterData {
    // User credentials (always required)
    username: string;
    password: string;
    email: string;
    nom: string;
    prenom: string;
    telephone?: string;
    roles: string[]; // e.g., ['ROLE_LIVREUR'], ['ROLE_CLIENT'], ['ROLE_MANAGER']

    // Business entity data (conditionally required)
    livreurData?: LivreurCreationData; // Required if roles includes ROLE_LIVREUR
    clientData?: ClientCreationData;   // Required if roles includes ROLE_CLIENT
}

// ============================================
// Business Entity Types (Simplified)
// ============================================

export interface Livreur {
    id: string;
    nom: string;
    prenom: string;
    telephone: string;
    vehicule: string;
    zoneAssigneeId?: string;
    zoneAssigneeNom?: string;
    actif: boolean;
    dateCreation?: string;
    dateModification?: string;
    userId?: string; // Link to User entity
}

/**
 * For updating Livreur business data ONLY
 * User credentials are managed through User/Admin endpoints
 */
export interface UpdateLivreurData {
    vehicule: string;
    zoneAssigneeId?: string;
    actif: boolean;
}

export interface Client {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    adresse: string;
    dateCreation?: string;
    userId?: string; // Link to User entity
}

/**
 * For updating Client business data ONLY
 * User credentials are managed through User/Admin endpoints
 */
export interface UpdateClientData {
    adresse: string;
}

// ============================================
// Colis Types
// ============================================

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

export interface Colis {
    id: string;
    description: string;
    poids: number;
    priorite: ColisPriorite;
    statut: ColisStatut;
    clientExpediteurId: string;
    destinataireId: string;
    livreurId?: string;
    zoneId?: string;
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
    clientExpediteurId?: string;
    destinataireId?: string;
    villeDestination: string;
    dateLimiteLivraison?: string;
    commentaire?: string;
    zoneId?: string;
}

export interface UpdateColisData extends CreateColisData {
    livreurId?: string;
    zoneId?: string;
    statut: ColisStatut;
    commentaire?: string;
}

export interface UpdateColisStatusData {
    statut: ColisStatut;
    commentaire?: string;
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

// ============================================
// Other Entity Types
// ============================================

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

export interface Produit {
    id: string;
    nom: string;
    categorie: string;
    poids: number;
    prix: number;
    dateCreation?: string;
}

export interface CreateProduitData {
    nom: string;
    categorie: string;
    poids: number;
    prix: number;
}

// ============================================
// Admin Management Types
// ============================================

export interface Role {
    id: string;
    name: string;
    description?: string;
    permissions: Permission[];
}

export interface CreateRoleData {
    name: string;
    description?: string;
    permissions?: string[]; // Permission IDs
}

export interface Permission {
    id: string;
    name: string;
    description?: string;
    resource: string;
    action: string;
}

export interface CreatePermissionData {
    name: string;
    description?: string;
    resource: string;
    action: string;
}

export interface UpdateUserData {
    username?: string;
    email?: string;
    nom?: string;
    prenom?: string;
    telephone?: string;
    actif?: boolean;
}

// ============================================
// Utility Types
// ============================================

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