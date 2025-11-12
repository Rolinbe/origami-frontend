export interface Service {
  id: string;
  name: string;
  code: string;
  color: string;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  serviceId: string;
  employeeType: 'permanent' | 'intern';
  contractStartDate: string;
  contractEndDate: string | null;
  isActive: boolean;
  profileImage: string | null;
  lastLogin: string | null;
}

export const mockServices: Service[] = [
  { id: "1", name: "Community Management", code: "CM", color: "#10B981" },
  { id: "2", name: "Création Visuelle", code: "CV", color: "#F59E0B" },
  { id: "3", name: "Informatique", code: "IT", color: "#3B82F6" },
  { id: "4", name: "Gestion Relation Client", code: "GRC", color: "#EF4444" },
  { id: "5", name: "Administration", code: "ADM", color: "#8B5CF6" }
];

export const mockEmployees: Employee[] = [
  {
    id: "1",
    firstName: "Jean",
    lastName: "Dupont",
    email: "jean.dupont@origami.mg",
    phone: "+261 34 12 345 67",
    position: "Développeur Full Stack",
    department: "Technique",
    serviceId: "3",
    employeeType: "permanent",
    contractStartDate: "2023-01-15",
    contractEndDate: null,
    isActive: true,
    profileImage: null,
    lastLogin: "2024-11-11T14:30:00"
  },
  {
    id: "2",
    firstName: "Marie",
    lastName: "Martin",
    email: "marie.martin@origami.mg",
    phone: "+261 34 23 456 78",
    position: "Community Manager",
    department: "Marketing",
    serviceId: "1",
    employeeType: "permanent",
    contractStartDate: "2022-06-01",
    contractEndDate: null,
    isActive: true,
    profileImage: null,
    lastLogin: "2024-11-12T09:15:00"
  },
  {
    id: "3",
    firstName: "Paul",
    lastName: "Bernard",
    email: "paul.bernard@origami.mg",
    phone: "+261 34 34 567 89",
    position: "Designer Graphique",
    department: "Créatif",
    serviceId: "2",
    employeeType: "intern",
    contractStartDate: "2024-09-01",
    contractEndDate: "2025-02-28",
    isActive: true,
    profileImage: null,
    lastLogin: "2024-11-12T08:45:00"
  },
  {
    id: "4",
    firstName: "Sophie",
    lastName: "Dubois",
    email: "sophie.dubois@origami.mg",
    phone: "+261 34 45 678 90",
    position: "Chargée de Clientèle",
    department: "Relation Client",
    serviceId: "4",
    employeeType: "permanent",
    contractStartDate: "2023-03-10",
    contractEndDate: null,
    isActive: true,
    profileImage: null,
    lastLogin: "2024-11-11T16:20:00"
  },
  {
    id: "5",
    firstName: "Thomas",
    lastName: "Petit",
    email: "thomas.petit@origami.mg",
    phone: "+261 34 56 789 01",
    position: "Assistant RH",
    department: "Ressources Humaines",
    serviceId: "5",
    employeeType: "intern",
    contractStartDate: "2024-10-01",
    contractEndDate: "2025-03-31",
    isActive: false,
    profileImage: null,
    lastLogin: null
  },
  {
    id: "6",
    firstName: "Alice",
    lastName: "Moreau",
    email: "alice.moreau@origami.mg",
    phone: "+261 34 67 890 12",
    position: "Chef de Projet",
    department: "Management",
    serviceId: "3",
    employeeType: "permanent",
    contractStartDate: "2021-11-01",
    contractEndDate: null,
    isActive: true,
    profileImage: null,
    lastLogin: "2024-11-12T10:00:00"
  },
  {
    id: "7",
    firstName: "Lucas",
    lastName: "Roux",
    email: "lucas.roux@origami.mg",
    phone: "+261 34 78 901 23",
    position: "Social Media Manager",
    department: "Marketing",
    serviceId: "1",
    employeeType: "permanent",
    contractStartDate: "2023-07-15",
    contractEndDate: null,
    isActive: true,
    profileImage: null,
    lastLogin: "2024-11-12T11:30:00"
  },
  {
    id: "8",
    firstName: "Emma",
    lastName: "Simon",
    email: "emma.simon@origami.mg",
    phone: "+261 34 89 012 34",
    position: "UI/UX Designer",
    department: "Design",
    serviceId: "2",
    employeeType: "permanent",
    contractStartDate: "2022-04-20",
    contractEndDate: null,
    isActive: false,
    profileImage: null,
    lastLogin: "2024-10-15T14:00:00"
  }
];