import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  GraphNode,
  GraphEdge,
  InventoryItem,
  Order,
  Robot,
  STRIPSState,
  STRIPSAction,
  UCSResult,
  ActivityLog,
  DeliveryHistoryItem,
  NodeId,
  Doctor,
} from '../types';
import {
  INITIAL_NODES,
  INITIAL_EDGES,
  INITIAL_INVENTORY,
  INITIAL_ORDERS,
  INITIAL_HISTORY,
  INITIAL_LOGS,
  INITIAL_DOCTORS,
} from '../data/initialData';
import { runUCS, generateUCSExplanation } from '../utils/ucs';

export type DeliveryPhase =
  | 'IDLE'
  | 'AVAILABILITY_CHECK'
  | 'SAVE_ORIGINAL'
  | 'MOVE_TO_PICKUP'
  | 'PICK_ITEM'
  | 'CALCULATE_DELIVERY_PATH'
  | 'NAVIGATING_TO_GOAL'
  | 'DELIVER_ITEM'
  | 'CALCULATE_RETURN_PATH'
  | 'NAVIGATING_RETURN'
  | 'ORDER_COMPLETED'
  | 'EMERGENCY_STOP'
  | 'RECHARGING';

export interface DoctorDeliveryStep {
  id: string;
  label: string;
  status: 'completed' | 'current' | 'pending';
}

interface AppContextType {
  // Doctor Auth & Persona
  currentDoctor: Doctor;
  doctors: Doctor[];
  loginDoctor: (doctorId: string) => boolean;
  logoutDoctor: () => void;
  isLoggedIn: boolean;

  // Graph & Navigation
  nodes: GraphNode[];
  edges: GraphEdge[];
  toggleBlockEdge: (edgeId: string) => void;
  setEdgeCost: (edgeId: string, cost: number) => void;
  resetGraph: () => void;
  getNodeById: (id: NodeId) => GraphNode | undefined;

  // Inventory
  inventory: InventoryItem[];
  updateInventoryStock: (id: string, quantity: number) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  checkItemAvailability: (name: string, quantity: number) => { available: boolean; item?: InventoryItem; message: string };

  // Orders & Requests
  orders: Order[];
  createOrder: (orderData: Omit<Order, 'id' | 'status' | 'createdAt' | 'originalRobotLocation'>) => { success: boolean; message: string; orderId?: string };
  submitDoctorRequest: (item: string, quantity: number, destination: NodeId, notes?: string) => { success: boolean; message: string; orderId?: string };
  cancelOrder: (orderId: string) => void;
  activeOrder: Order | null;
  doctorSteps: DoctorDeliveryStep[];

  // Robot State & Operations
  robot: Robot;
  stripsState: STRIPSState;
  stripsActions: STRIPSAction[];
  deliveryPhase: DeliveryPhase;
  phaseMessage: string;
  originalSavedLocation: NodeId;
  activeUCSResult: UCSResult | null;
  returnUCSResult: UCSResult | null;
  aiExplanation: string;
  simulationSpeedMs: number;
  setSimulationSpeedMs: (speed: number) => void;

  // Operations & Controls
  startOrderDelivery: (orderId: string) => boolean;
  startDemoDelivery: () => void;
  stepDeliveryWorkflow: () => void;
  pauseWorkflow: () => void;
  resumeWorkflow: () => void;
  resetRobotToDock: () => void;
  rechargeRobot: () => void;
  emergencyStop: () => void;

  // Planner Interactive Testing
  plannerStart: NodeId;
  setPlannerStart: (node: NodeId) => void;
  plannerGoal: NodeId;
  setPlannerGoal: (node: NodeId) => void;
  testUCSResult: UCSResult | null;
  runTestUCS: () => void;
  stepByStepTestIndex: number;
  stepTestUCS: () => void;
  resetTestUCS: () => void;

  // History & Logs
  history: DeliveryHistoryItem[];
  logs: ActivityLog[];
  addLog: (category: ActivityLog['category'], message: string, severity?: ActivityLog['severity'], metadata?: Record<string, any>) => void;
  clearLogs: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Doctor Auth & Persona
  const [doctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [currentDoctor, setCurrentDoctor] = useState<Doctor>(INITIAL_DOCTORS[0]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

  const loginDoctor = useCallback((doctorId: string): boolean => {
    const trimmed = doctorId.trim().toLowerCase();
    const found = doctors.find(
      (d) => d.id.toLowerCase() === trimmed || d.name.toLowerCase().includes(trimmed)
    );
    if (found) {
      setCurrentDoctor(found);
      setIsLoggedIn(true);
      return true;
    }
    if (doctorId.trim().length >= 2) {
      const customDoc: Doctor = {
        id: doctorId.toUpperCase().startsWith('DOC-') ? doctorId.toUpperCase() : `DOC-${Math.floor(100 + Math.random() * 900)}`,
        name: doctorId.toLowerCase().startsWith('dr') ? doctorId : `Dr. ${doctorId}`,
        department: 'General Medical Staff',
      };
      setCurrentDoctor(customDoc);
      setIsLoggedIn(true);
      return true;
    }
    return false;
  }, [doctors]);

  const logoutDoctor = useCallback(() => {
    setIsLoggedIn(false);
  }, []);

  // Graph State
  const [nodes, setNodes] = useState<GraphNode[]>(INITIAL_NODES);
  const [edges, setEdges] = useState<GraphEdge[]>(INITIAL_EDGES);

  // Inventory State
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);

  // Orders State
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [activeOrderId, setActiveOrderId] = useState<string | null>('MED-1042');

  // Robot State
  const [robot, setRobot] = useState<Robot>({
    id: 'MR-001',
    currentLocation: 'Main Corridor',
    originalLocation: 'Main Corridor',
    goalLocation: null,
    hasItem: false,
    delivered: false,
    battery: 96,
    status: 'IDLE',
    speedMps: 1.2,
    activeOrderId: null,
    heldItem: null,
    lowBatteryThreshold: 20,
  });

  // Original saved location per requirement
  const [originalSavedLocation, setOriginalSavedLocation] = useState<NodeId>('Main Corridor');

  // STRIPS State
  const [stripsState, setStripsState] = useState<STRIPSState>({
    robotLocation: 'Main Corridor',
    hasItem: false,
    itemAvailable: true,
    delivered: false,
    pathAvailable: true,
    batteryAdequate: true,
  });

  // Delivery Workflow Engine
  const [deliveryPhase, setDeliveryPhase] = useState<DeliveryPhase>('IDLE');
  const [phaseMessage, setPhaseMessage] = useState<string>('Robot is docked at Main Corridor. Standing by for dispatch.');
  const [activeUCSResult, setActiveUCSResult] = useState<UCSResult | null>(null);
  const [returnUCSResult, setReturnUCSResult] = useState<UCSResult | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string>(
    'Uniform Cost Search stands ready to compute optimal min-heap cumulative routes across clinical graph nodes.'
  );

  // Planner Interactive Test State
  const [plannerStart, setPlannerStart] = useState<NodeId>('Pharmacy');
  const [plannerGoal, setPlannerGoal] = useState<NodeId>('Room F-102');
  const [testUCSResult, setTestUCSResult] = useState<UCSResult | null>(null);
  const [stepByStepTestIndex, setStepByStepTestIndex] = useState<number>(0);

  // Simulation Controls
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [simulationSpeedMs, setSimulationSpeedMs] = useState<number>(1200);

  // Logs & History
  const [logs, setLogs] = useState<ActivityLog[]>(INITIAL_LOGS);
  const [history, setHistory] = useState<DeliveryHistoryItem[]>(INITIAL_HISTORY);

  // References for async intervals
  const executionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const navigationIndexRef = useRef<number>(0);
  const navigationPathRef = useRef<NodeId[]>([]);
  const isPausedRef = useRef<boolean>(false);
  isPausedRef.current = isPaused;

  const activeOrder = orders.find((o) => o.id === activeOrderId) || null;

  const addLog = useCallback(
    (
      category: ActivityLog['category'],
      message: string,
      severity: ActivityLog['severity'] = 'info',
      metadata?: Record<string, any>
    ) => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const newEntry: ActivityLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: timeStr,
        category,
        message,
        severity,
        metadata,
      };
      setLogs((prev) => [newEntry, ...prev.slice(0, 199)]);
    },
    []
  );

  const clearLogs = () => setLogs([]);

  const getNodeById = useCallback((id: NodeId) => nodes.find((n) => n.id === id), [nodes]);

  // Graph manipulation
  const toggleBlockEdge = useCallback(
    (edgeId: string) => {
      setEdges((prev) =>
        prev.map((edge) => {
          if (edge.id === edgeId) {
            const nextBlocked = !edge.blocked;
            addLog(
              'UCS',
              `Corridor [${edge.from} ↔ ${edge.to}] ${nextBlocked ? 'BLOCKED' : 'UNBLOCKED'} by operator.`,
              nextBlocked ? 'warning' : 'info'
            );
            return { ...edge, blocked: nextBlocked };
          }
          return edge;
        })
      );
    },
    [addLog]
  );

  const setEdgeCost = useCallback(
    (edgeId: string, cost: number) => {
      setEdges((prev) =>
        prev.map((edge) => {
          if (edge.id === edgeId) {
            addLog('UCS', `Corridor cost updated for [${edge.from} ↔ ${edge.to}]: ${cost}`, 'info');
            return { ...edge, cost: Math.max(1, cost) };
          }
          return edge;
        })
      );
    },
    [addLog]
  );

  const resetGraph = useCallback(() => {
    setEdges(INITIAL_EDGES);
    setNodes(INITIAL_NODES);
    addLog('SYSTEM', 'Hospital graph corridors and weights reset to factory specifications.', 'info');
  }, [addLog]);

  // Inventory manipulation
  const updateInventoryStock = useCallback(
    (id: string, quantity: number) => {
      setInventory((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            const qty = Math.max(0, quantity);
            return { ...item, quantity: qty, available: qty > 0 };
          }
          return item;
        })
      );
      addLog('INVENTORY', `Inventory item #${id} quantity set to ${quantity}`, 'info');
    },
    [addLog]
  );

  const addInventoryItem = useCallback(
    (itemData: Omit<InventoryItem, 'id'>) => {
      const newId = `INV-${String(inventory.length + 1).padStart(3, '0')}`;
      const newItem: InventoryItem = {
        ...itemData,
        id: newId,
        available: itemData.quantity > 0,
      };
      setInventory((prev) => [...prev, newItem]);
      addLog('INVENTORY', `Added new medical item: ${newItem.name} (${newItem.quantity} units)`, 'success');
    },
    [inventory.length, addLog]
  );

  const checkItemAvailability = useCallback(
    (name: string, quantity: number) => {
      const match = inventory.find((i) => i.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(i.name.toLowerCase()));
      if (!match) {
        return { available: false, message: `Medical item "${name}" not found in hospital inventory catalog.` };
      }
      if (match.quantity < quantity) {
        return {
          available: false,
          item: match,
          message: `Insufficient stock for "${match.name}". Requested: ${quantity}, Available: ${match.quantity}.`,
        };
      }
      return {
        available: true,
        item: match,
        message: `Stock confirmed: ${match.quantity} units of "${match.name}" available at ${match.location}.`,
      };
    },
    [inventory]
  );

  // Orders creation & management
  const createOrder = useCallback(
    (orderData: Omit<Order, 'id' | 'status' | 'createdAt' | 'originalRobotLocation'>) => {
      // 1. Check item availability
      const stockCheck = checkItemAvailability(orderData.item, orderData.quantity);
      if (!stockCheck.available) {
        addLog('ORDER', `Order creation rejected: ${stockCheck.message}`, 'error');
        return { success: false, message: stockCheck.message };
      }

      // 2. Validate destination
      const destNode = nodes.find((n) => n.id === orderData.destination);
      if (!destNode) {
        return { success: false, message: `Invalid hospital destination "${orderData.destination}".` };
      }

      const newId = `MED-${Math.floor(1000 + Math.random() * 9000)}`;
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const newOrder: Order = {
        ...orderData,
        id: newId,
        status: 'Pending',
        originalRobotLocation: robot.currentLocation,
        createdAt: timeStr,
      };

      setOrders((prev) => [newOrder, ...prev]);
      setActiveOrderId(newId);
      addLog('ORDER', `Created clinical dispatch order ${newId} (${orderData.item} x${orderData.quantity} → ${orderData.destination})`, 'success');

      return { success: true, message: `Order ${newId} queued for execution.`, orderId: newId };
    },
    [checkItemAvailability, nodes, robot.currentLocation, addLog]
  );

  const cancelOrder = useCallback(
    (orderId: string) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'Failed' as const, notes: 'Cancelled by operator' } : o))
      );
      addLog('ORDER', `Order ${orderId} was cancelled by operator.`, 'warning');
    },
    [addLog]
  );

  // Interactive Test UCS (for Planner page and map experiments)
  const runTestUCS = useCallback(() => {
    addLog('UCS', `Running Uniform Cost Search from "${plannerStart}" to "${plannerGoal}"...`, 'info');
    const result = runUCS(plannerStart, plannerGoal, edges);
    setTestUCSResult(result);
    setStepByStepTestIndex(result.steps.length > 0 ? 1 : 0);

    const expl = generateUCSExplanation(plannerStart, plannerGoal, result);
    setAiExplanation(expl);

    if (result.success) {
      addLog('UCS', `Optimal UCS path discovered: ${result.path.join(' → ')} (Total Cost: ${result.cost})`, 'success');
    } else {
      addLog('UCS', `UCS failed: ${result.errorMessage}`, 'error');
    }
  }, [plannerStart, plannerGoal, edges, addLog]);

  const stepTestUCS = useCallback(() => {
    if (!testUCSResult || testUCSResult.steps.length === 0) return;
    setStepByStepTestIndex((prev) => {
      if (prev >= testUCSResult.steps.length) return prev;
      return prev + 1;
    });
  }, [testUCSResult]);

  const resetTestUCS = useCallback(() => {
    setTestUCSResult(null);
    setStepByStepTestIndex(0);
  }, []);

  // Compute STRIPS action definitions based on current state
  const stripsActions: STRIPSAction[] = [
    {
      name: 'Pick Item',
      description: 'Pickup payload at dispensary/pharmacy if present and empty-handed.',
      preconditions: {
        ItemAvailable: true,
        RobotAt: 'Pharmacy',
        RobotHasItem: false,
      },
      addEffects: {
        RobotHasItem: true,
      },
      deleteEffects: {
        ItemAvailable: true,
      },
      isExecutable:
        stripsState.itemAvailable &&
        stripsState.robotLocation === 'Pharmacy' &&
        !stripsState.hasItem,
    },
    {
      name: 'Move Robot',
      description: 'Traverse corridors from current node to target destination via UCS.',
      preconditions: {
        PathAvailable: true,
        BatteryAdequate: true,
      },
      addEffects: {
        RobotAt: robot.goalLocation || 'Destination',
      },
      deleteEffects: {
        RobotAt: robot.currentLocation,
      },
      isExecutable: stripsState.pathAvailable && stripsState.batteryAdequate,
    },
    {
      name: 'Deliver Item',
      description: 'Secure payload handoff at patient room destination.',
      preconditions: {
        RobotAt: activeOrder?.destination || 'PatientRoom',
        RobotHasItem: true,
      },
      addEffects: {
        ItemDelivered: true,
      },
      deleteEffects: {
        RobotHasItem: true,
      },
      isExecutable:
        stripsState.hasItem &&
        activeOrder !== null &&
        stripsState.robotLocation === activeOrder.destination,
    },
    {
      name: 'Return Robot',
      description: 'Calculate UCS reverse trajectory to original starting location.',
      preconditions: {
        ItemDelivered: true,
        OriginalLocationExists: true,
      },
      addEffects: {
        RobotAt: originalSavedLocation,
      },
      deleteEffects: {
        RobotAt: activeOrder?.destination || 'DeliveryLocation',
      },
      isExecutable: stripsState.delivered && !!originalSavedLocation,
    },
  ];

  // Battery drain helper
  const consumeBattery = useCallback((cost: number) => {
    setRobot((prev) => {
      const drain = Math.round(cost * 1.5);
      const nextBattery = Math.max(0, prev.battery - drain);
      return { ...prev, battery: nextBattery };
    });
  }, []);

  // Clear execution intervals
  const clearExecutionTimer = () => {
    if (executionTimerRef.current) {
      clearInterval(executionTimerRef.current);
      executionTimerRef.current = null;
    }
  };

  // Emergency Stop
  const emergencyStop = useCallback(() => {
    clearExecutionTimer();
    setDeliveryPhase('EMERGENCY_STOP');
    setRobot((prev) => ({ ...prev, status: 'EMERGENCY_STOP' }));
    setPhaseMessage('EMERGENCY STOP ACTIVATED. All motor actuators quarantined.');
    addLog('SECURITY', 'Emergency stop triggered by safety supervisor.', 'error');
  }, [addLog]);

  // Recharge Robot
  const rechargeRobot = useCallback(() => {
    clearExecutionTimer();
    addLog('ROBOT', `Robot ${robot.id} navigating to Charging Station via UCS...`, 'warning');
    const ucsToCharge = runUCS(robot.currentLocation, 'Charging Station', edges);
    if (!ucsToCharge.success) {
      addLog('ROBOT', 'Cannot reach Charging Station: corridors blocked!', 'error');
      return;
    }
    setDeliveryPhase('RECHARGING');
    setPhaseMessage('Navigating to inductive Charging Station (40kW)...');

    // Simulate navigation to charging station
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < ucsToCharge.path.length) {
        const nextNode = ucsToCharge.path[step];
        setRobot((prev) => ({
          ...prev,
          currentLocation: nextNode,
          status: 'NAVIGATING',
        }));
      } else {
        clearInterval(interval);
        setRobot((prev) => ({
          ...prev,
          currentLocation: 'Charging Station',
          status: 'CHARGING',
          battery: 100,
        }));
        setStripsState((prev) => ({ ...prev, robotLocation: 'Charging Station', batteryAdequate: true }));
        setPhaseMessage('Inductive recharge complete (100% capacity). Robot ready.');
        addLog('ROBOT', 'Battery charged to 100%. Standing by.', 'success');
        setDeliveryPhase('IDLE');
      }
    }, 800);
  }, [robot.id, robot.currentLocation, edges, addLog]);

  // Reset to Dock
  const resetRobotToDock = useCallback(() => {
    clearExecutionTimer();
    setDeliveryPhase('IDLE');
    setPhaseMessage('Robot reset to Main Corridor docking bay.');
    setRobot((prev) => ({
      ...prev,
      currentLocation: 'Main Corridor',
      originalLocation: 'Main Corridor',
      goalLocation: null,
      hasItem: false,
      delivered: false,
      status: 'IDLE',
      heldItem: null,
      activeOrderId: null,
    }));
    setOriginalSavedLocation('Main Corridor');
    setStripsState({
      robotLocation: 'Main Corridor',
      hasItem: false,
      itemAvailable: true,
      delivered: false,
      pathAvailable: true,
      batteryAdequate: true,
    });
    setActiveUCSResult(null);
    setReturnUCSResult(null);
    addLog('SYSTEM', 'Robot MR-001 reset to base state at Main Corridor.', 'info');
  }, [addLog]);

  // Complete Delivery Workflow execution engine
  const runWorkflowStep = useCallback(
    (order: Order) => {
      // Check battery before moving
      if (robot.battery <= robot.lowBatteryThreshold) {
        addLog('ROBOT', `Low battery warning (${robot.battery}%). Rerouting to Charging Station recommended.`, 'warning');
      }

      switch (deliveryPhase) {
        case 'IDLE': {
          // 1. Check item availability
          setDeliveryPhase('AVAILABILITY_CHECK');
          setPhaseMessage(`Checking catalog inventory for ${order.item} (${order.quantity} units)...`);
          addLog('ORDER', `Starting delivery workflow for order ${order.id}`, 'info');

          const check = checkItemAvailability(order.item, order.quantity);
          if (!check.available) {
            setDeliveryPhase('EMERGENCY_STOP');
            setPhaseMessage(`Mission aborted: ${check.message}`);
            addLog('INVENTORY', check.message, 'error');
            setOrders((prev) =>
              prev.map((o) => (o.id === order.id ? { ...o, status: 'Failed', notes: check.message } : o))
            );
            return;
          }

          addLog('INVENTORY', check.message, 'success');

          // 2. Save Original Robot Location
          const savedLoc = robot.currentLocation;
          setOriginalSavedLocation(savedLoc);
          setRobot((prev) => ({ ...prev, originalLocation: savedLoc, activeOrderId: order.id, status: 'PICKING' }));
          setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: 'Processing', originalRobotLocation: savedLoc } : o)));
          addLog('ROBOT', `Robot original location saved: [${savedLoc}]`, 'info');

          // If robot already at pickup location, jump to pick
          if (robot.currentLocation === order.pickupLocation) {
            setDeliveryPhase('PICK_ITEM');
            setPhaseMessage(`Robot at pickup point (${order.pickupLocation}). Loading payload...`);
          } else {
            // Need to navigate to pickup location first
            setDeliveryPhase('MOVE_TO_PICKUP');
            setPhaseMessage(`Calculating path to pickup location (${order.pickupLocation})...`);
            const ucsToPickup = runUCS(robot.currentLocation, order.pickupLocation, edges);
            if (!ucsToPickup.success) {
              setDeliveryPhase('EMERGENCY_STOP');
              setPhaseMessage(`No route from current position to ${order.pickupLocation}. Corridors blocked.`);
              addLog('UCS', `Failed to reach pickup: ${ucsToPickup.errorMessage}`, 'error');
              return;
            }
            navigationPathRef.current = ucsToPickup.path;
            navigationIndexRef.current = 0;
          }
          break;
        }

        case 'MOVE_TO_PICKUP': {
          // Navigating to pickup node
          const path = navigationPathRef.current;
          navigationIndexRef.current += 1;
          const idx = navigationIndexRef.current;

          if (idx < path.length) {
            const nextNode = path[idx];
            setRobot((prev) => ({ ...prev, currentLocation: nextNode, status: 'NAVIGATING' }));
            setStripsState((prev) => ({ ...prev, robotLocation: nextNode }));
            consumeBattery(1.5);
            setPhaseMessage(`Repositioning to pickup: reached ${nextNode} (${idx}/${path.length - 1})`);
            addLog('ROBOT', `Navigated to node [${nextNode}] en route to pickup`, 'info');
          } else {
            // Reached pickup location!
            setDeliveryPhase('PICK_ITEM');
            setPhaseMessage(`Arrived at ${order.pickupLocation}. Ready to pick item.`);
          }
          break;
        }

        case 'PICK_ITEM': {
          // STRIPS Action: Pick Item
          // Deduct from inventory
          const itemMatch = inventory.find((i) => i.name.toLowerCase().includes(order.item.toLowerCase()));
          if (itemMatch) {
            updateInventoryStock(itemMatch.id, itemMatch.quantity - order.quantity);
          }

          setRobot((prev) => ({
            ...prev,
            hasItem: true,
            heldItem: `${order.item} (x${order.quantity})`,
            status: 'NAVIGATING',
            goalLocation: order.destination,
          }));

          setStripsState((prev) => ({
            ...prev,
            hasItem: true,
            itemAvailable: false, // removed from dispensary shelf
            robotLocation: order.pickupLocation,
          }));

          addLog(
            'STRIPS',
            `Action "Pick Item" executed. Preconditions: [ItemAvailable=T, RobotAt=Pharmacy, RobotHasItem=F]. Add: {RobotHasItem=T}, Del: {ItemAvailable=T}`,
            'success'
          );

          // Now calculate UCS to delivery destination
          setDeliveryPhase('CALCULATE_DELIVERY_PATH');
          setPhaseMessage(`Running Uniform Cost Search for delivery route to ${order.destination}...`);
          break;
        }

        case 'CALCULATE_DELIVERY_PATH': {
          addLog('UCS', `UCS started: Start=[${robot.currentLocation}], Goal=[${order.destination}]`, 'info');
          const outboundResult = runUCS(robot.currentLocation, order.destination, edges);
          setActiveUCSResult(outboundResult);

          if (!outboundResult.success) {
            setDeliveryPhase('EMERGENCY_STOP');
            setPhaseMessage(`No route found to ${order.destination}. Corridors blocked.`);
            addLog('UCS', outboundResult.errorMessage || 'Path calculation failed.', 'error');
            return;
          }

          const expl = generateUCSExplanation(robot.currentLocation, order.destination, outboundResult);
          setAiExplanation(expl);

          addLog(
            'UCS',
            `Optimal delivery path found: ${outboundResult.path.join(' → ')} (Cumulative Cost: ${outboundResult.cost})`,
            'success'
          );

          setOrders((prev) =>
            prev.map((o) =>
              o.id === order.id
                ? {
                    ...o,
                    status: 'Navigating',
                    deliveryPath: outboundResult.path,
                    deliveryCost: outboundResult.cost,
                  }
                : o
            )
          );

          navigationPathRef.current = outboundResult.path;
          navigationIndexRef.current = 0;
          setDeliveryPhase('NAVIGATING_TO_GOAL');
          setPhaseMessage(`Navigating to ${order.destination} via optimal UCS trajectory...`);
          break;
        }

        case 'NAVIGATING_TO_GOAL': {
          const path = navigationPathRef.current;
          navigationIndexRef.current += 1;
          const idx = navigationIndexRef.current;

          if (idx < path.length) {
            const nextNode = path[idx];
            setRobot((prev) => ({
              ...prev,
              currentLocation: nextNode,
              status: 'NAVIGATING',
            }));
            setStripsState((prev) => ({ ...prev, robotLocation: nextNode }));
            consumeBattery(2);
            setPhaseMessage(`Navigating outbound: reached ${nextNode} (Waypoint ${idx}/${path.length - 1})`);
            addLog('ROBOT', `Robot moved to [${nextNode}] on delivery trajectory`, 'info');
          } else {
            // Reached destination!
            setDeliveryPhase('DELIVER_ITEM');
            setPhaseMessage(`Arrived at destination (${order.destination}). Initiating clinical handoff.`);
          }
          break;
        }

        case 'DELIVER_ITEM': {
          // STRIPS Action: Deliver Item
          setRobot((prev) => ({
            ...prev,
            hasItem: false,
            heldItem: null,
            delivered: true,
            status: 'DELIVERING',
          }));

          setStripsState((prev) => ({
            ...prev,
            hasItem: false,
            delivered: true,
            robotLocation: order.destination,
          }));

          setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: 'Delivered' } : o)));

          addLog(
            'STRIPS',
            `Action "Deliver Item" executed at ${order.destination}. Preconditions: [RobotAt=${order.destination}, RobotHasItem=T]. Add: {ItemDelivered=T}, Del: {RobotHasItem=T}`,
            'success'
          );

          setPhaseMessage(`Delivery confirmed for patient ${order.patient}. Setting return goal to saved original location [${originalSavedLocation}]...`);
          setDeliveryPhase('CALCULATE_RETURN_PATH');
          break;
        }

        case 'CALCULATE_RETURN_PATH': {
          // Calculate reverse UCS to EXACT original location!
          addLog(
            'UCS',
            `Return UCS started: Start=[${robot.currentLocation}], Goal=[${originalSavedLocation}] (Saved Original Location)`,
            'info'
          );

          const returnResult = runUCS(robot.currentLocation, originalSavedLocation, edges);
          setReturnUCSResult(returnResult);

          if (!returnResult.success) {
            setDeliveryPhase('EMERGENCY_STOP');
            setPhaseMessage(`Cannot return to ${originalSavedLocation}. Corridors blocked.`);
            addLog('UCS', `Return route calculation failed: ${returnResult.errorMessage}`, 'error');
            return;
          }

          const returnExpl = `After successful payload handoff at "${order.destination}", the robot recalculated an optimal return UCS route back to its saved original dock at "${originalSavedLocation}".\n\nReturn Path: ${returnResult.path.join(
            ' → '
          )}\nReturn Cost: ${returnResult.cost}\nNodes Explored: ${returnResult.visitedNodes.join(', ')}`;
          setAiExplanation(returnExpl);

          addLog(
            'UCS',
            `Optimal return path calculated: ${returnResult.path.join(' → ')} (Cost: ${returnResult.cost})`,
            'success'
          );

          setOrders((prev) =>
            prev.map((o) =>
              o.id === order.id
                ? {
                    ...o,
                    status: 'Returning',
                    returnPath: returnResult.path,
                    returnCost: returnResult.cost,
                  }
                : o
            )
          );

          setRobot((prev) => ({ ...prev, status: 'RETURNING', goalLocation: originalSavedLocation }));
          navigationPathRef.current = returnResult.path;
          navigationIndexRef.current = 0;
          setDeliveryPhase('NAVIGATING_RETURN');
          setPhaseMessage(`Navigating return trajectory to ${originalSavedLocation}...`);
          break;
        }

        case 'NAVIGATING_RETURN': {
          const path = navigationPathRef.current;
          navigationIndexRef.current += 1;
          const idx = navigationIndexRef.current;

          if (idx < path.length) {
            const nextNode = path[idx];
            setRobot((prev) => ({
              ...prev,
              currentLocation: nextNode,
              status: 'RETURNING',
            }));
            setStripsState((prev) => ({ ...prev, robotLocation: nextNode }));
            consumeBattery(2);
            setPhaseMessage(`Returning: reached ${nextNode} (Waypoint ${idx}/${path.length - 1})`);
            addLog('ROBOT', `Robot returned through [${nextNode}]`, 'info');
          } else {
            // Reached exact original location!
            setDeliveryPhase('ORDER_COMPLETED');
            setPhaseMessage(`Robot successfully returned to original location [${originalSavedLocation}]. Order completed.`);
          }
          break;
        }

        case 'ORDER_COMPLETED': {
          clearExecutionTimer();
          setRobot((prev) => ({
            ...prev,
            currentLocation: originalSavedLocation,
            goalLocation: null,
            status: 'IDLE',
            activeOrderId: null,
            delivered: false,
            hasItem: false,
          }));

          setStripsState((prev) => ({
            ...prev,
            robotLocation: originalSavedLocation,
            hasItem: false,
            delivered: false,
          }));

          const now = new Date();
          const compTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          setOrders((prev) =>
            prev.map((o) => (o.id === order.id ? { ...o, status: 'Completed', completedAt: compTime } : o))
          );

          // Add to History record
          const deliveryCost = activeUCSResult?.cost || order.deliveryCost || 7;
          const returnCost = returnUCSResult?.cost || order.returnCost || 5;
          const totalCost = deliveryCost + returnCost;

          const historyItem: DeliveryHistoryItem = {
            id: `HIST-${Date.now().toString().slice(-4)}`,
            orderId: order.id,
            patient: order.patient,
            item: order.item,
            quantity: order.quantity,
            origin: order.pickupLocation,
            destination: order.destination,
            deliveryPath: activeUCSResult?.path || order.deliveryPath || [],
            deliveryCost,
            returnPath: returnUCSResult?.path || order.returnPath || [],
            returnCost,
            totalCost,
            status: 'Completed',
            durationSeconds: Math.floor(60 + Math.random() * 90),
            timestamp: `Today, ${compTime}`,
          };

          setHistory((prev) => [historyItem, ...prev]);

          addLog('ORDER', `Mission MED-${order.id.replace('MED-', '')} completed with 100% telemetry verification.`, 'success');
          addLog('STRIPS', `Action "Return Robot" satisfied. Robot restored at original location [${originalSavedLocation}].`, 'success');

          setDeliveryPhase('IDLE');
          setPhaseMessage('Order completed. Robot MR-001 is docked and idle.');
          break;
        }

        default:
          break;
      }
    },
    [
      robot,
      deliveryPhase,
      inventory,
      edges,
      originalSavedLocation,
      activeUCSResult,
      returnUCSResult,
      checkItemAvailability,
      updateInventoryStock,
      consumeBattery,
      addLog,
    ]
  );

  // Automated continuous runner
  const startOrderDelivery = useCallback(
    (orderId: string): boolean => {
      const targetOrder = orders.find((o) => o.id === orderId);
      if (!targetOrder) {
        addLog('ORDER', `Cannot start order ${orderId}: Order not found.`, 'error');
        return false;
      }

      if (robot.status !== 'IDLE' && deliveryPhase !== 'IDLE') {
        addLog('ROBOT', `Robot MR-001 is currently busy in state "${robot.status}". Please wait or reset.`, 'warning');
        return false;
      }

      setActiveOrderId(orderId);
      setIsPaused(false);
      isPausedRef.current = false;

      // Start the phase machine
      setDeliveryPhase('IDLE');
      setTimeout(() => {
        runWorkflowStep(targetOrder);
      }, 50);

      // Setup continuous tick
      clearExecutionTimer();
      executionTimerRef.current = setInterval(() => {
        if (!isPausedRef.current) {
          setOrders((currentOrders) => {
            const currentOrd = currentOrders.find((o) => o.id === orderId);
            if (currentOrd) {
              runWorkflowStep(currentOrd);
            }
            return currentOrders;
          });
        }
      }, simulationSpeedMs);

      return true;
    },
    [orders, robot.status, deliveryPhase, runWorkflowStep, simulationSpeedMs, addLog]
  );

  // Demo Delivery MED-1042 shortcut
  const startDemoDelivery = useCallback(() => {
    let demoOrder = orders.find((o) => o.id === 'MED-1042');
    if (!demoOrder) {
      demoOrder = {
        id: 'MED-1042',
        patient: 'Eleanor Vance',
        patientId: 'PT-8942',
        item: 'Paracetamol',
        quantity: 2,
        priority: 'HIGH',
        destination: 'Room F-102',
        pickupLocation: 'Pharmacy',
        status: 'Pending',
        originalRobotLocation: 'Main Corridor',
        createdAt: '10:45 AM',
      };
      setOrders((prev) => [demoOrder!, ...prev]);
    } else {
      setOrders((prev) =>
        prev.map((o) => (o.id === 'MED-1042' ? { ...o, status: 'Pending' } : o))
      );
    }

    startOrderDelivery('MED-1042');
  }, [orders, startOrderDelivery]);

  // Step-by-step trigger for manual exploration
  const stepDeliveryWorkflow = useCallback(() => {
    if (!activeOrder) return;
    runWorkflowStep(activeOrder);
  }, [activeOrder, runWorkflowStep]);

  const pauseWorkflow = useCallback(() => {
    setIsPaused(true);
    isPausedRef.current = true;
    addLog('SYSTEM', 'Autonomous mission paused by operator.', 'warning');
  }, [addLog]);

  const resumeWorkflow = useCallback(() => {
    setIsPaused(false);
    isPausedRef.current = false;
    addLog('SYSTEM', 'Autonomous mission resumed.', 'info');
  }, [addLog]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearExecutionTimer();
  }, []);

  // Doctor delivery steps computation
  const doctorSteps: DoctorDeliveryStep[] = [
    {
      id: 'step-1',
      label: 'Request received',
      status: deliveryPhase === 'IDLE' ? 'pending' : 'completed',
    },
    {
      id: 'step-2',
      label: 'Item available',
      status:
        deliveryPhase === 'IDLE'
          ? 'pending'
          : deliveryPhase === 'AVAILABILITY_CHECK'
          ? 'current'
          : 'completed',
    },
    {
      id: 'step-3',
      label: 'Robot preparing',
      status:
        deliveryPhase === 'IDLE' || deliveryPhase === 'AVAILABILITY_CHECK'
          ? 'pending'
          : deliveryPhase === 'SAVE_ORIGINAL' || deliveryPhase === 'MOVE_TO_PICKUP' || deliveryPhase === 'PICK_ITEM'
          ? 'current'
          : 'completed',
    },
    {
      id: 'step-4',
      label: 'Robot travelling',
      status:
        deliveryPhase === 'CALCULATE_DELIVERY_PATH' || deliveryPhase === 'NAVIGATING_TO_GOAL'
          ? 'current'
          : ['DELIVER_ITEM', 'CALCULATE_RETURN_PATH', 'NAVIGATING_RETURN', 'ORDER_COMPLETED'].includes(deliveryPhase)
          ? 'completed'
          : 'pending',
    },
    {
      id: 'step-5',
      label: 'Delivery',
      status:
        deliveryPhase === 'DELIVER_ITEM'
          ? 'current'
          : ['CALCULATE_RETURN_PATH', 'NAVIGATING_RETURN', 'ORDER_COMPLETED'].includes(deliveryPhase)
          ? 'completed'
          : 'pending',
    },
    {
      id: 'step-6',
      label: 'Returning to starting location',
      status:
        deliveryPhase === 'CALCULATE_RETURN_PATH' || deliveryPhase === 'NAVIGATING_RETURN'
          ? 'current'
          : deliveryPhase === 'ORDER_COMPLETED'
          ? 'completed'
          : 'pending',
    },
  ];

  const submitDoctorRequest = useCallback(
    (item: string, quantity: number, destination: NodeId, notes?: string) => {
      const matched = inventory.find(
        (i) => i.name.toLowerCase().includes(item.toLowerCase()) || item.toLowerCase().includes(i.name.toLowerCase())
      );
      const pickupLocation = matched ? matched.location : 'Pharmacy';

      const res = createOrder({
        patient: `${currentDoctor.department} Patient`,
        patientId: `PT-${Math.floor(1000 + Math.random() * 9000)}`,
        item,
        quantity,
        priority: 'HIGH',
        destination,
        pickupLocation,
        notes: notes || `Ordered by ${currentDoctor.name} (${currentDoctor.id})`,
      });

      if (res.success && res.orderId) {
        startOrderDelivery(res.orderId);
      }
      return res;
    },
    [currentDoctor, inventory, createOrder, startOrderDelivery]
  );

  return (
    <AppContext.Provider
      value={{
        currentDoctor,
        doctors,
        loginDoctor,
        logoutDoctor,
        isLoggedIn,
        doctorSteps,
        submitDoctorRequest,
        nodes,
        edges,
        toggleBlockEdge,
        setEdgeCost,
        resetGraph,
        getNodeById,
        inventory,
        updateInventoryStock,
        addInventoryItem,
        checkItemAvailability,
        orders,
        createOrder,
        cancelOrder,
        activeOrder,
        robot,
        stripsState,
        stripsActions,
        deliveryPhase,
        phaseMessage,
        originalSavedLocation,
        activeUCSResult,
        returnUCSResult,
        aiExplanation,
        simulationSpeedMs,
        setSimulationSpeedMs,
        startOrderDelivery,
        startDemoDelivery,
        stepDeliveryWorkflow,
        pauseWorkflow,
        resumeWorkflow,
        resetRobotToDock,
        rechargeRobot,
        emergencyStop,
        plannerStart,
        setPlannerStart,
        plannerGoal,
        setPlannerGoal,
        testUCSResult,
        runTestUCS,
        stepByStepTestIndex,
        stepTestUCS,
        resetTestUCS,
        history,
        logs,
        addLog,
        clearLogs,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
