import React, {
  createContext,
  type ReactNode,
  useContext,
  useState,
} from 'react';
import { type SourceData } from '.';

interface SourcesContextType {
  sourceData: SourceData;
  changeSourceData: (sourceData: SourceData) => void;
}

const SourcesContext = createContext<SourcesContextType | undefined>(undefined);

export const useSources = (): SourcesContextType => {
  const context = useContext(SourcesContext);

  if (!context) {
    throw new Error('useSources must be used within a SourcesContextProvider');
  }
  return context;
};

export const SourcesProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [sourceData, setSourceData] = useState({
    id: 0,
    name: '',
    description: '',
    ingestRegion: '',
    status: '',
  });
  const changeSourceData = (sourceData: SourceData) => {
    setSourceData(sourceData);
  };

  return (
    <SourcesContext.Provider value={{ sourceData, changeSourceData }}>
      {children}
    </SourcesContext.Provider>
  );
};
