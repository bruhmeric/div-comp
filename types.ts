
export interface DeviceSpecs {
  display: string;
  camera: string;
  processor: string;
  battery: string;
  ram: string;
  storage: string;
  price: string;
}

export interface DeviceData {
  name: string;
  specs: DeviceSpecs;
  pros: string[];
  cons: string[];
}

export interface ComparisonResponse {
  device1: DeviceData;
  device2: DeviceData;
  summary: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
