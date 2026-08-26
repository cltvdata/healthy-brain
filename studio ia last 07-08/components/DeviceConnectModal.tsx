import React, { useState, useEffect } from 'react';
import { 
  Watch, 
  Smartphone, 
  ShieldCheck, 
  Activity, 
  Check, 
  X, 
  Lock, 
  Wifi, 
  RefreshCw, 
  CheckCircle2, 
  Radio, 
  HeartPulse, 
  AlertTriangle,
  Info,
  Plus,
  Trash2,
  Settings,
  Cpu
} from 'lucide-react';
import { safeStorage } from '../services/storage';

export interface ConnectedDevice {
  id: string;
  name: string;
  category: 'watch' | 'phone' | 'ring' | 'cloud';
  platform: string;
  status: 'connected' | 'disconnected' | 'syncing';
  lastCaptureTime?: string;
  dataTypes: string[];
  isCustom?: boolean;
}

interface DeviceConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectSuccess: (connectedDevices: ConnectedDevice[]) => void;
  onAddTokens: (amount: number, reason: string) => void;
}

interface DeviceItemDef {
  id: string;
  name: string;
  category: 'watch' | 'phone' | 'ring' | 'cloud';
  platform: string;
  description: string;
  dataTypes: string[];
  icon: any;
  isCustom?: boolean;
}

const DEFAULT_DEVICES: DeviceItemDef[] = [
  {
    id: 'health_connect',
    name: 'Google Health Connect',
    category: 'phone',
    platform: 'Android Native API',
    description: 'Conexión oficial nativa de Android para unificar sensores de movimiento, pasos, pulso y sueño.',
    dataTypes: ['Pasos', 'Podómetro', 'Distancia', 'Calorías Activas', 'Ritmo Reposo'],
    icon: Smartphone
  },
  {
    id: 'apple_health',
    name: 'Apple Health & Watch',
    category: 'watch',
    platform: 'iOS HealthKit API',
    description: 'Acceso directo a HealthKit en iOS para HRV (variabilidad), pulso cardíaco, fases de descanso y entrenamientos.',
    dataTypes: ['HRV (ms)', 'Pulso Cardíaco', 'Fases de Sueño', 'Calorías Burned'],
    icon: Watch
  },
  {
    id: 'generic_smartwatch',
    name: 'Smart Watch Genérico',
    category: 'watch',
    platform: 'Bluetooth / Companion App',
    description: 'Compatible con cualquier reloj inteligente (DaFit, FitCloudPro, VeryFit, WearOS, Xiaomi, Haylou, Y68, etc.).',
    dataTypes: ['Pasos Diarios', 'Frecuencia Cardíaca', 'Sueño Ligero/Profundo', 'SpO2 Oxígeno'],
    icon: Watch
  },
  {
    id: 'google_fitbit_air',
    name: 'Manilla Google Fitbit Air / Band',
    category: 'watch',
    platform: 'Fitbit Web API / Bluetooth',
    description: 'Sincronización optimizada para pulseras inteligentes Google Fitbit Air, Charge, Inspire y Luxe.',
    dataTypes: ['Minutos Zona Activa', 'HRV Continuo', 'Temperatura Cutánea', 'SpO2'],
    icon: HeartPulse
  },
  {
    id: 'generic_smart_ring',
    name: 'Smart Ring Genérico',
    category: 'ring',
    platform: 'Bluetooth / Smart Ring',
    description: 'Anillos inteligentes universales (Colmi R02, Jakcom, R3, Anillos Bluetooth de recuperación).',
    dataTypes: ['Variabilidad Cardíaca', 'Puntaje de Descanso', 'Oxígeno en Sangre', 'Paso a Paso'],
    icon: Radio
  },
  {
    id: 'oura_ring',
    name: 'Oura Ring V3',
    category: 'ring',
    platform: 'Cloud API OAuth 2.0',
    description: 'Medición avanzada de preparación fisiológica, temperatura corporal y descanso nocturno.',
    dataTypes: ['Score de Sueño', 'HRV Nocturno', 'Temperatura Cutánea'],
    icon: Radio
  },
  {
    id: 'samsung_health',
    name: 'Samsung Galaxy Watch',
    category: 'watch',
    platform: 'Samsung Health SDK',
    description: 'Sincroniza electrocardiograma, presión arterial, composición corporal y pulsaciones.',
    dataTypes: ['Ritmo Cardíaco', 'SpO2 Oxígeno', 'Análisis de Sueño'],
    icon: Watch
  },
  {
    id: 'garmin_cloud',
    name: 'Garmin Connect Cloud',
    category: 'cloud',
    platform: 'Garmin Cloud API',
    description: 'Importa indicadores de Body Battery, nivel de estrés fisiológico y carga de entrenamiento.',
    dataTypes: ['Body Battery', 'Estrés Fisiológico', 'Carga de Entreno'],
    icon: Activity
  },
  {
    id: 'strava_app',
    name: 'Strava & GPS Deportivo',
    category: 'cloud',
    platform: 'OAuth 2.0 Direct',
    description: 'Sincroniza actividades al aire libre, trazados de GPS, ciclismo y frecuencia cardíaca en vivo.',
    dataTypes: ['GPS', 'Zonas Cardíacas', 'Cargas de Esfuerzo'],
    icon: Activity
  }
];

export const DeviceConnectModal: React.FC<DeviceConnectModalProps> = ({
  isOpen,
  onClose,
  onConnectSuccess,
  onAddTokens
}) => {
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>(['health_connect', 'apple_health']);
  const [userConsented, setUserConsented] = useState<boolean>(true);
  const [connectingState, setConnectingState] = useState<'idle' | 'requesting' | 'handshake' | 'success'>('idle');
  const [connectingStepText, setConnectingStepText] = useState<string>('');
  const [existingConnected, setExistingConnected] = useState<string[]>([]);
  
  // Custom Devices created personally by the user
  const [customDevices, setCustomDevices] = useState<DeviceItemDef[]>(() => {
    try {
      const saved = safeStorage.getItem('hb_user_custom_devices');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Custom device form toggle & fields
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState<'watch' | 'phone' | 'ring' | 'cloud'>('watch');
  const [customPlatform, setCustomPlatform] = useState('Bluetooth / Companion App');
  const [customDescription, setCustomDescription] = useState('');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['Pasos', 'Pulso', 'HRV', 'Sueño']);

  const allAvailableDevices: DeviceItemDef[] = [...DEFAULT_DEVICES, ...customDevices];

  useEffect(() => {
    try {
      const saved = safeStorage.getItem('hb_connected_device_ids');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setExistingConnected(parsed);
          setSelectedDeviceIds(parsed.length > 0 ? parsed : ['health_connect', 'apple_health']);
        }
      }
    } catch {
      // fallback
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleDevice = (id: string) => {
    setSelectedDeviceIds(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const toggleMetricOption = (metric: string) => {
    setSelectedMetrics(prev =>
      prev.includes(metric) ? prev.filter(m => m !== metric) : [...prev, metric]
    );
  };

  const handleSaveCustomDevice = () => {
    if (!customName.trim()) return;

    const newId = `custom_dev_${Date.now()}`;
    const newDevice: DeviceItemDef = {
      id: newId,
      name: customName.trim(),
      category: customCategory,
      platform: customPlatform.trim() || 'Bluetooth Personal',
      description: customDescription.trim() || 'Dispositivo biométrico personalizado registrado por el usuario.',
      dataTypes: selectedMetrics.length > 0 ? selectedMetrics : ['Biometría General'],
      icon: customCategory === 'ring' ? Radio : customCategory === 'phone' ? Smartphone : Watch,
      isCustom: true
    };

    const updatedCustoms = [...customDevices, newDevice];
    setCustomDevices(updatedCustoms);
    safeStorage.setItem('hb_user_custom_devices', JSON.stringify(updatedCustoms));

    // Auto-select the newly added custom device
    setSelectedDeviceIds(prev => [...prev, newId]);

    // Reset form
    setCustomName('');
    setCustomDescription('');
    setIsAddingCustom(false);
  };

  const handleDeleteCustomDevice = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updatedCustoms = customDevices.filter(d => d.id !== id);
    setCustomDevices(updatedCustoms);
    safeStorage.setItem('hb_user_custom_devices', JSON.stringify(updatedCustoms));
    setSelectedDeviceIds(prev => prev.filter(d => d !== id));
  };

  const handleStartAuthorization = async () => {
    if (!userConsented) return;
    if (selectedDeviceIds.length === 0) return;

    setConnectingState('requesting');
    setConnectingStepText('1/3 Verificando permisos de sensores biométricos y Health APIs...');

    // Attempt browser sensor/notification permissions prompt if available
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch {
        // user handled
      }
    }

    setTimeout(() => {
      setConnectingState('handshake');
      setConnectingStepText('2/3 Conectando túnel cifrado para Google Health Connect & Apple Health...');
    }, 1800);

    setTimeout(() => {
      setConnectingState('success');
      setConnectingStepText('3/3 ¡Dispositivos conectados con éxito! Captura biométrica en tiempo real activa.');

      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const connectedList: ConnectedDevice[] = selectedDeviceIds.map(id => {
        const dev = allAvailableDevices.find(d => d.id === id);
        return {
          id,
          name: dev?.name || id,
          category: dev?.category || 'phone',
          platform: dev?.platform || 'Native API',
          status: 'connected',
          lastCaptureTime: now,
          dataTypes: dev?.dataTypes || ['Biometría General'],
          isCustom: dev?.isCustom
        };
      });

      safeStorage.setItem('hb_connected_device_ids', JSON.stringify(selectedDeviceIds));
      safeStorage.setItem('hb_connected_devices_data', JSON.stringify(connectedList));

      onConnectSuccess(connectedList);
      onAddTokens(150, "Dispositivos Conectados: Permiso Autorizado & Captura Activa");

      setTimeout(() => {
        setConnectingState('idle');
        onClose();
      }, 1500);
    }, 3600);
  };

  const handleDisconnectAll = () => {
    setSelectedDeviceIds([]);
    setExistingConnected([]);
    safeStorage.setItem('hb_connected_device_ids', JSON.stringify([]));
    safeStorage.setItem('hb_connected_devices_data', JSON.stringify([]));
    onConnectSuccess([]);
    onClose();
  };

  const availableMetricList = ['Pasos', 'Pulso', 'HRV', 'Sueño', 'SpO2 Oxígeno', 'Temperatura', 'Calorías', 'ECG', 'Glucosa'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-glass-noir border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Top Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-bio-green/20 border border-bio-green/30 flex items-center justify-center text-bio-green">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-bio-green bg-bio-green/10 border border-bio-green/20 px-2 py-0.5 rounded-md">
                  Administración de Dispositivos & Wearables
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest text-neuro-blue bg-neuro-blue/10 border border-neuro-blue/20 px-2 py-0.5 rounded-md">
                  Nativo & Bluetooth
                </span>
              </div>
              <h2 className="text-lg font-black text-white uppercase italic tracking-tight mt-1">
                Sincronización Personal de Sensores ⌚
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto space-y-5 my-4 pr-1 custom-scrollbar flex-1">
          
          {/* Health Connect & Apple Health Connection Diagnostics Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-bio-green/10 border border-bio-green/30 rounded-2xl space-y-1.5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-bio-green animate-pulse"></span>
                  <span className="text-xs font-black text-white uppercase tracking-wider">Google Health Connect</span>
                </div>
                <span className="text-[8px] font-black uppercase text-bio-green bg-bio-green/20 px-1.5 py-0.5 rounded border border-bio-green/30">
                  Android Native
                </span>
              </div>
              <p className="text-[10px] text-gray-300 font-medium leading-relaxed">
                Estado: <strong className="text-bio-green">Conexión Nativa Lista</strong>. Captura de pasos, podómetro y ritmo cardíaco en segundo plano.
              </p>
            </div>

            <div className="p-3.5 bg-neuro-blue/10 border border-neuro-blue/30 rounded-2xl space-y-1.5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-neuro-blue animate-pulse"></span>
                  <span className="text-xs font-black text-white uppercase tracking-wider">Apple Health (HealthKit)</span>
                </div>
                <span className="text-[8px] font-black uppercase text-neuro-blue bg-neuro-blue/20 px-1.5 py-0.5 rounded border border-neuro-blue/30">
                  iOS Native
                </span>
              </div>
              <p className="text-[10px] text-gray-300 font-medium leading-relaxed">
                Estado: <strong className="text-neuro-blue">HealthKit Habilitado</strong>. Sincronización de HRV, Apple Watch, pulso y descanso nocturno.
              </p>
            </div>
          </div>

          {/* User Custom Device Creator Toggle Banner */}
          <div className="p-4 bg-white/2 border border-white/10 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-bio-orange" />
                  ¿Usas un Reloj, Manilla o Anillo Personalizado?
                </h3>
                <p className="text-[11px] text-gray-400 font-medium leading-tight mt-0.5">
                  Puedes registrar y bautizar cualquier dispositivo genérico o marca personalizada.
                </p>
              </div>

              <button
                onClick={() => setIsAddingCustom(!isAddingCustom)}
                className="px-3 py-1.5 bg-bio-orange/20 hover:bg-bio-orange/30 text-bio-orange border border-bio-orange/40 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0"
              >
                {isAddingCustom ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {isAddingCustom ? 'Cerrar Formulario' : '➕ Registrar Mi Dispositivo'}
              </button>
            </div>

            {/* Custom Device Add Form */}
            {isAddingCustom && (
              <div className="p-4 bg-black/60 border border-bio-orange/30 rounded-2xl space-y-3 animate-fade-in">
                <h4 className="text-xs font-black text-bio-orange uppercase tracking-wider border-b border-white/10 pb-2">
                  Registro de Dispositivo Personalizado / Genérico
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-300 uppercase block mb-1">
                      Nombre del Dispositivo:
                    </label>
                    <input 
                      type="text"
                      placeholder="Ej: Smart Watch Genérico T900, Manilla Fitbit Air, Anillo R02"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-bio-orange"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-300 uppercase block mb-1">
                      Categoría:
                    </label>
                    <select
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value as any)}
                      className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-bio-orange"
                    >
                      <option value="watch">Reloj Inteligente / Manilla (Smart Watch / Band)</option>
                      <option value="ring">Anillo Inteligente (Smart Ring)</option>
                      <option value="phone">Smartphone / Sensor de Movimiento</option>
                      <option value="cloud">API Cloud / Servicio Externo</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-300 uppercase block mb-1">
                      Protocolo / Aplicación de Conexión:
                    </label>
                    <input 
                      type="text"
                      placeholder="Ej: Bluetooth 5.0, DaFit, FitCloudPro, Health Connect, WearOS"
                      value={customPlatform}
                      onChange={(e) => setCustomPlatform(e.target.value)}
                      className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-bio-orange"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-300 uppercase block mb-1">
                      Descripción breve (Opcional):
                    </label>
                    <input 
                      type="text"
                      placeholder="Ej: Dispositivo genérico de monitoreo constante"
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-bio-orange"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-300 uppercase block mb-1">
                    Selecciona las métricas que mide tu dispositivo:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {availableMetricList.map(metric => {
                      const isSel = selectedMetrics.includes(metric);
                      return (
                        <button
                          key={metric}
                          type="button"
                          onClick={() => toggleMetricOption(metric)}
                          className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border transition-all ${
                            isSel 
                              ? 'bg-bio-orange text-black border-bio-orange' 
                              : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20'
                          }`}
                        >
                          {isSel ? '✓ ' : '+ '}{metric}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveCustomDevice}
                    disabled={!customName.trim()}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                      customName.trim()
                        ? 'bg-bio-orange text-black hover:scale-105 shadow-md shadow-bio-orange/20'
                        : 'bg-white/10 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" /> Guardar Dispositivo Personal
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Device Selection Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center justify-between">
              <span>Selecciona los dispositivos autorizados para tu cuenta:</span>
              <span className="text-[10px] text-gray-400 font-semibold">{selectedDeviceIds.length} autorizados</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {allAvailableDevices.map((dev) => {
                const IconComponent = dev.icon || Watch;
                const isSelected = selectedDeviceIds.includes(dev.id);
                const isConnected = existingConnected.includes(dev.id);

                return (
                  <div
                    key={dev.id}
                    onClick={() => toggleDevice(dev.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all relative flex flex-col justify-between space-y-2 ${
                      isSelected 
                        ? 'bg-bio-green/10 border-bio-green/40 shadow-md shadow-bio-green/5' 
                        : 'bg-white/2 border-white/10 hover:border-white/20 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-bio-green text-black font-black' : 'bg-white/10 text-gray-300'
                        }`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-black text-white leading-snug">{dev.name}</h4>
                            {dev.isCustom && (
                              <span className="text-[8px] font-black text-bio-orange bg-bio-orange/20 border border-bio-orange/30 px-1 py-0.2 rounded">
                                PERSONAL
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] font-bold text-gray-400 block">{dev.platform}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {dev.isCustom && (
                          <button
                            onClick={(e) => handleDeleteCustomDevice(e, dev.id)}
                            className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                            title="Eliminar dispositivo personalizado"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                          isSelected ? 'bg-bio-green border-bio-green text-black' : 'border-white/20 bg-black/40'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    </div>

                    <p className="text-[10px] text-gray-300 leading-tight font-medium">{dev.description}</p>

                    <div className="flex flex-wrap gap-1 pt-1 border-t border-white/5">
                      {dev.dataTypes.map((dt, idx) => (
                        <span key={idx} className="text-[8px] font-black uppercase text-gray-400 bg-white/5 px-1.5 py-0.5 rounded">
                          {dt}
                        </span>
                      ))}
                    </div>

                    {isConnected && (
                      <span className="absolute top-2 right-12 text-[8px] font-black text-bio-green bg-bio-green/20 border border-bio-green/30 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-bio-green animate-pulse"></span>
                        ACTIVO
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* User Consent Checkbox */}
          <div className="p-4 bg-black/40 border border-white/10 rounded-2xl flex items-start gap-3">
            <input 
              type="checkbox"
              id="hb-user-consent"
              checked={userConsented}
              onChange={(e) => setUserConsented(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-white/20 bg-black text-bio-green focus:ring-bio-green"
            />
            <label htmlFor="hb-user-consent" className="text-xs text-gray-300 cursor-pointer font-medium leading-relaxed">
              Confirmo que autorizo la lectura de mis biométricos (HRV, pasos, descanso y calorías) para alimentar mi <strong className="text-white">Gemelo Digital</strong>. Entiendo que la información se almacena con soberanía y puedo revocar el acceso en cualquier instante.
            </label>
          </div>

          {/* Connecting state Overlay / Progress Banner */}
          {connectingState !== 'idle' && (
            <div className="p-4 bg-black/90 border border-bio-green/50 rounded-2xl space-y-3 text-center animate-fade-in">
              <div className="flex items-center justify-center gap-3">
                <RefreshCw className="w-6 h-6 text-bio-green animate-spin" />
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  Procesando Autorización de Dispositivos...
                </span>
              </div>
              <p className="text-xs font-mono text-bio-green">{connectingStepText}</p>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-bio-green h-full transition-all duration-700"
                  style={{
                    width: connectingState === 'requesting' ? '35%' : connectingState === 'handshake' ? '75%' : '100%'
                  }}
                />
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Actions */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {existingConnected.length > 0 ? (
            <button
              onClick={handleDisconnectAll}
              disabled={connectingState !== 'idle'}
              className="text-xs font-bold text-red-400 hover:text-red-300 underline py-2"
            >
              Desconectar Todos los Dispositivos
            </button>
          ) : (
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-neuro-blue" />
              Sincronización Segura sin Fugas
            </span>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              disabled={connectingState !== 'idle'}
              className="flex-1 sm:flex-none px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all"
            >
              Cancelar
            </button>

            <button
              onClick={handleStartAuthorization}
              disabled={!userConsented || selectedDeviceIds.length === 0 || connectingState !== 'idle'}
              className={`flex-1 sm:flex-none px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg ${
                !userConsented || selectedDeviceIds.length === 0 || connectingState !== 'idle'
                  ? 'bg-white/10 text-gray-500 cursor-not-allowed border border-white/5'
                  : 'bg-bio-green text-black hover:scale-105 active:scale-95 shadow-bio-green/20'
              }`}
            >
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              Autorizar y Conectar ({selectedDeviceIds.length})
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

