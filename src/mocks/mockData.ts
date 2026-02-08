import { User, UserRole, Colis, ColisStatut, ColisPriorite, PageResponse } from '../types';

// ============================================
// Mock Users
// ============================================

export const mockManager: User = {
    id: 'user-manager-1',
    username: 'manager1',
    email: 'manager@deligo.com',
    nom: 'Manager',
    prenom: 'Test',
    telephone: '0600000001',
    roles: [UserRole.MANAGER],
    permissions: ['READ_ALL', 'WRITE_ALL', 'DELETE_ALL'],
    actif: true,
    dateCreation: '2024-01-01T00:00:00Z',
};

export const mockLivreur: User = {
    id: 'user-livreur-1',
    username: 'livreur1',
    email: 'livreur@deligo.com',
    nom: 'Livreur',
    prenom: 'Test',
    telephone: '0600000002',
    roles: [UserRole.LIVREUR],
    permissions: ['READ_COLIS', 'UPDATE_STATUS'],
    livreurId: 'livreur-1',
    actif: true,
    dateCreation: '2024-01-01T00:00:00Z',
};

export const mockClient: User = {
    id: 'user-client-1',
    username: 'client1',
    email: 'client@deligo.com',
    nom: 'Client',
    prenom: 'Test',
    telephone: '0600000003',
    roles: [UserRole.CLIENT],
    permissions: ['READ_COLIS', 'CREATE_COLIS'],
    clientExpediteurId: 'client-1',
    actif: true,
    dateCreation: '2024-01-01T00:00:00Z',
};

// ============================================
// Mock Colis
// ============================================

export const mockColis1: Colis = {
    id: 'colis-1',
    description: 'Colis urgent - Documents importants',
    poids: 2.5,
    priorite: ColisPriorite.URGENTE,
    statut: ColisStatut.EN_TRANSIT,
    clientExpediteurId: 'client-1',
    destinataireId: 'dest-1',
    livreurId: 'livreur-1',
    zoneId: 'zone-1',
    villeDestination: 'Paris',
    dateCreation: '2024-02-01T10:00:00Z',
    dateModification: '2024-02-01T11:00:00Z',
    dateLimiteLivraison: '2024-02-05T18:00:00Z',
    commentaire: 'Livraison express',
};

export const mockColis2: Colis = {
    id: 'colis-2',
    description: 'Colis standard - Vêtements',
    poids: 1.2,
    priorite: ColisPriorite.NORMALE,
    statut: ColisStatut.EN_STOCK,
    clientExpediteurId: 'client-2',
    destinataireId: 'dest-2',
    villeDestination: 'Lyon',
    dateCreation: '2024-02-02T14:00:00Z',
    dateModification: '2024-02-02T14:00:00Z',
};

export const mockColis3: Colis = {
    id: 'colis-3',
    description: 'Colis livré - Électronique',
    poids: 3.0,
    priorite: ColisPriorite.HAUTE,
    statut: ColisStatut.LIVRE,
    clientExpediteurId: 'client-1',
    destinataireId: 'dest-3',
    livreurId: 'livreur-1',
    villeDestination: 'Marseille',
    dateCreation: '2024-01-28T09:00:00Z',
    dateModification: '2024-01-30T16:30:00Z',
    dateLimiteLivraison: '2024-01-31T18:00:00Z',
    commentaire: 'Livraison effectuée',
};

export const mockColisList: Colis[] = [mockColis1, mockColis2, mockColis3];

// ============================================
// Mock Paginated Response
// ============================================

export const mockColisPageResponse: PageResponse<Colis> = {
    content: mockColisList,
    totalElements: 3,
    totalPages: 1,
    size: 20,
    number: 0,
    first: true,
    last: true,
    empty: false,
};

export const mockEmptyPageResponse: PageResponse<Colis> = {
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 20,
    number: 0,
    first: true,
    last: true,
    empty: true,
};

// ============================================
// Mock API Responses
// ============================================

export const mockLoginResponse = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    type: 'Bearer',
    ...mockManager,
};

export const mockLoginError = {
    message: 'Identifiants incorrects',
    status: 401,
};