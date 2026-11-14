import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface LocationContextType {
  pincode: string;
  locationName: string;
  isServiceable: boolean;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  setPincodeAndVerify: (pin: string) => Promise<{ success: boolean; message: string }>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pincode, setPincode] = useState<string>(localStorage.getItem('meat_corner_pincode') || '638116');
  const [locationName, setLocationName] = useState<string>(localStorage.getItem('meat_corner_loc_name') || 'Kanjikovil, Erode');
  const [isServiceable, setIsServiceable] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const setPincodeAndVerify = async (pin: string) => {
    try {
      const res = await api.checkPincode(pin);
      if (res.serviceable) {
        setPincode(pin);
        const name = res.data?.areaName || `PIN ${pin}`;
        setLocationName(name);
        setIsServiceable(true);
        localStorage.setItem('meat_corner_pincode', pin);
        localStorage.setItem('meat_corner_loc_name', name);
        return { success: true, message: res.message };
      } else {
        return { success: false, message: res.message || 'Location not serviceable' };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Could not verify PIN code' };
    }
  };

  useEffect(() => {
    // Initial verification
    api.checkPincode(pincode).then((res) => {
      setIsServiceable(Boolean(res.serviceable));
    }).catch(() => {});
  }, []);

  return (
    <LocationContext.Provider
      value={{
        pincode,
        locationName,
        isServiceable,
        isModalOpen,
        openModal,
        closeModal,
        setPincodeAndVerify
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocation must be used within LocationProvider');
  return context;
};
