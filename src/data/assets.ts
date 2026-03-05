export type AssetCondition = "New" | "Good" | "Fair" | "Poor" | "Decommissioned";
export type AssetCategory = "IT Equipment" | "Office Furniture" | "Appliances" | "Consumables" | "AV Equipment";

export interface Asset {
  id: string;
  assetId: string;
  name: string;
  category: AssetCategory;
  location: string;
  building: string;
  floor: string;
  room: string;
  department: string;
  vendor: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  condition: AssetCondition;
  lastAuditDate: string;
  auditStatus: "Verified" | "Pending" | "Discrepancy";
}

export const CATEGORIES: AssetCategory[] = ["IT Equipment", "Office Furniture", "Appliances", "Consumables", "AV Equipment"];
export const CONDITIONS: AssetCondition[] = ["New", "Good", "Fair", "Poor", "Decommissioned"];

export const LOCATIONS = [
  { building: "HQ Building", floors: ["Floor 1", "Floor 2", "Floor 3"], rooms: ["Room 101", "Room 102", "Room 201", "Room 205", "Room 301"] },
  { building: "Annex Building", floors: ["Floor 1", "Floor 2"], rooms: ["Room A1", "Room A2", "Room B1"] },
  { building: "Warehouse", floors: ["Ground"], rooms: ["Bay 1", "Bay 2", "Storage"] },
];

export const DEPARTMENTS = ["IT", "Finance", "HR", "Operations", "Marketing", "Executive"];

let nextId = 48;
export const generateAssetId = () => {
  nextId++;
  return `AST-${String(nextId).padStart(5, "0")}`;
};

export const sampleAssets: Asset[] = [
  { id: "1", assetId: "AST-00001", name: 'Dell Latitude 5540 Laptop', category: "IT Equipment", location: "HQ Building – Floor 2 – Room 205", building: "HQ Building", floor: "Floor 2", room: "Room 205", department: "IT", vendor: "Dell Technologies", model: "Latitude 5540", serialNumber: "DL5540-X9K2M", purchaseDate: "2024-03-15", condition: "New", lastAuditDate: "2026-02-28", auditStatus: "Verified" },
  { id: "2", assetId: "AST-00002", name: 'HP LaserJet Pro MFP', category: "IT Equipment", location: "HQ Building – Floor 1 – Room 101", building: "HQ Building", floor: "Floor 1", room: "Room 101", department: "Operations", vendor: "HP Inc.", model: "LaserJet Pro M428fdw", serialNumber: "HP428-Q3R7T", purchaseDate: "2023-11-20", condition: "Good", lastAuditDate: "2026-02-28", auditStatus: "Verified" },
  { id: "3", assetId: "AST-00003", name: 'Herman Miller Aeron Chair', category: "Office Furniture", location: "HQ Building – Floor 3 – Room 301", building: "HQ Building", floor: "Floor 3", room: "Room 301", department: "Executive", vendor: "Herman Miller", model: "Aeron Size B", serialNumber: "HM-AER-2024-001", purchaseDate: "2024-01-10", condition: "New", lastAuditDate: "2026-02-28", auditStatus: "Verified" },
  { id: "4", assetId: "AST-00004", name: 'Standing Desk – Electric', category: "Office Furniture", location: "HQ Building – Floor 2 – Room 205", building: "HQ Building", floor: "Floor 2", room: "Room 205", department: "IT", vendor: "Uplift Desk", model: "V2 Commercial", serialNumber: "UPL-V2C-7821", purchaseDate: "2024-06-01", condition: "Good", lastAuditDate: "2026-02-28", auditStatus: "Verified" },
  { id: "5", assetId: "AST-00005", name: 'Samsung 4K Monitor 27"', category: "IT Equipment", location: "HQ Building – Floor 2 – Room 205", building: "HQ Building", floor: "Floor 2", room: "Room 205", department: "IT", vendor: "Samsung", model: "U28R550UQN", serialNumber: "SAM-28R-K4521", purchaseDate: "2024-03-15", condition: "Good", lastAuditDate: "2026-01-15", auditStatus: "Pending" },
  { id: "6", assetId: "AST-00006", name: 'Nespresso Coffee Machine', category: "Appliances", location: "HQ Building – Floor 1 – Room 102", building: "HQ Building", floor: "Floor 1", room: "Room 102", department: "Operations", vendor: "Nespresso", model: "Vertuo Next", serialNumber: "NSP-VN-3382", purchaseDate: "2025-01-05", condition: "New", lastAuditDate: "2026-02-28", auditStatus: "Verified" },
  { id: "7", assetId: "AST-00007", name: 'Cisco IP Phone 8845', category: "IT Equipment", location: "Annex Building – Floor 1 – Room A1", building: "Annex Building", floor: "Floor 1", room: "Room A1", department: "Finance", vendor: "Cisco", model: "IP Phone 8845", serialNumber: "CSC-8845-P9201", purchaseDate: "2023-08-12", condition: "Good", lastAuditDate: "2026-02-28", auditStatus: "Verified" },
  { id: "8", assetId: "AST-00008", name: 'Epson Projector EB-992F', category: "AV Equipment", location: "HQ Building – Floor 3 – Room 301", building: "HQ Building", floor: "Floor 3", room: "Room 301", department: "Executive", vendor: "Epson", model: "EB-992F", serialNumber: "EPS-992-F4410", purchaseDate: "2024-09-01", condition: "Good", lastAuditDate: "2026-01-15", auditStatus: "Pending" },
  { id: "9", assetId: "AST-00009", name: 'Paper Shredder – Cross Cut', category: "Appliances", location: "Annex Building – Floor 2 – Room B1", building: "Annex Building", floor: "Floor 2", room: "Room B1", department: "HR", vendor: "Fellowes", model: "Powershred 79Ci", serialNumber: "FLW-79C-8833", purchaseDate: "2022-05-20", condition: "Fair", lastAuditDate: "2026-02-28", auditStatus: "Discrepancy" },
  { id: "10", assetId: "AST-00010", name: 'Whiteboard – Mobile 48x72', category: "Office Furniture", location: "HQ Building – Floor 1 – Room 101", building: "HQ Building", floor: "Floor 1", room: "Room 101", department: "Operations", vendor: "Quartet", model: "Prestige 2 Mobile", serialNumber: "QRT-P2M-2244", purchaseDate: "2023-03-10", condition: "Good", lastAuditDate: "2026-02-28", auditStatus: "Verified" },
  { id: "11", assetId: "AST-00011", name: 'MacBook Pro 16" M3 Max', category: "IT Equipment", location: "HQ Building – Floor 3 – Room 301", building: "HQ Building", floor: "Floor 3", room: "Room 301", department: "Executive", vendor: "Apple", model: "MacBook Pro 16 M3 Max", serialNumber: "APL-MBP16-C7741", purchaseDate: "2025-02-01", condition: "New", lastAuditDate: "2026-02-28", auditStatus: "Verified" },
  { id: "12", assetId: "AST-00012", name: 'Filing Cabinet 4-Drawer', category: "Office Furniture", location: "Annex Building – Floor 1 – Room A2", building: "Annex Building", floor: "Floor 1", room: "Room A2", department: "Finance", vendor: "HON", model: "510 Series", serialNumber: "HON-510-1198", purchaseDate: "2021-07-15", condition: "Fair", lastAuditDate: "2026-01-15", auditStatus: "Pending" },
];
