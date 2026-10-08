export type NodeId = string;

export interface Doctor {
  id: string;
  name: string;
  department: string;
  avatar?: string;
}

export interface GraphNode {
  id: NodeId;
  name: string;
  category: 'pharmacy' | 'corridor' | 'ward' | 'room' | 'charging' | 'lab' | 'icu';
  x: number; // Percentage or coordinate for canvas
  y: number;
  description: string;
}

export interface GraphEdge {
  id: string;
  from: NodeId;
  to: NodeId;
  cost: number;
  blocked: boolean;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Medication' | 'Specimen' | 'Kit' | 'Document' | 'Emergency';
  quantity: number;
  location: NodeId;
  available: boolean;
  dosage?: string;
  storageTemp?: string;
}

export type OrderPriority = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';

export type OrderStatus =
  | 'Pending'
  | 'Processing'
  | 'Navigating'
  | 'Delivered'
  | 'Returning'
  | 'Completed'
  | 'Failed';

export interface Order {
  id: string;
  patient: string;
  patientId: string;
  item: string;
  quantity: number;
  priority: OrderPriority;
  destination: NodeId;
  pickupLocation: NodeId;
  status: OrderStatus;
  originalRobotLocation: NodeId;
  deliveryPath?: string[];
  returnPath?: string[];
  deliveryCost?: number;
  returnCost?: number;
  createdAt: string;
  completedAt?: string;
  notes?: string;
}

export type RobotState = 'IDLE' | 'PICKING' | 'NAVIGATING' | 'DELIVERING' | 'RETURNING' | 'CHARGING' | 'EMERGENCY_STOP';

export interface Robot {
  id: string;
  currentLocation: NodeId;
  originalLocation: NodeId;
  goalLocation: NodeId | null;
  hasItem: boolean;
  delivered: boolean;
  battery: number;
  status: RobotState;
  speedMps: number;
  activeOrderId: string | null;
  heldItem: string | null;
  lowBatteryThreshold: number;
}

export interface STRIPSState {
  robotLocation: NodeId;
  hasItem: boolean;
  itemAvailable: boolean;
  delivered: boolean;
  pathAvailable: boolean;
  batteryAdequate: boolean;
}

export interface STRIPSAction {
  name: string;
  description: string;
  preconditions: Record<string, any>;
  addEffects: Record<string, any>;
  deleteEffects: Record<string, any>;
  isExecutable: boolean;
}

export interface UCSElement {
  node: NodeId;
  cost: number;
  path: NodeId[];
  parent: NodeId | null;
}

export interface UCSStep {
  stepNumber: number;
  currentNode: NodeId;
  cumulativeCost: number;
  queueSnapshot: UCSElement[];
  visitedSnapshot: NodeId[];
  actionDescription: string;
}

export interface UCSResult {
  path: NodeId[];
  cost: number;
  visitedNodes: NodeId[];
  steps: UCSStep[];
  success: boolean;
  errorMessage?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  category: 'ORDER' | 'UCS' | 'STRIPS' | 'ROBOT' | 'INVENTORY' | 'SYSTEM' | 'SECURITY';
  message: string;
  severity: 'info' | 'success' | 'warning' | 'error';
  metadata?: Record<string, any>;
}

export interface DeliveryHistoryItem {
  id: string;
  orderId: string;
  patient: string;
  item: string;
  quantity: number;
  origin: NodeId;
  destination: NodeId;
  deliveryPath: string[];
  deliveryCost: number;
  returnPath: string[];
  returnCost: number;
  totalCost: number;
  status: 'Completed' | 'Failed';
  durationSeconds: number;
  timestamp: string;
}
