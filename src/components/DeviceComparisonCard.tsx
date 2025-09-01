import React, { CSSProperties } from 'react';
import { DeviceData } from '../../types';

interface DeviceComparisonCardProps {
  device: DeviceData;
  style?: CSSProperties;
}

const SpecItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between items-center py-3 border-b border-base-300 last:border-b-0">
    <dt className="text-sm font-medium text-text-secondary">{label}</dt>
    <dd className="text-sm text-right text-text-primary">{value}</dd>
  </div>
);

const ProConItem: React.FC<{ text: string; isPro: boolean }> = ({ text, isPro }) => (
  <li className="flex items-start space-x-3 py-2">
    <div className="flex-shrink-0">
      {isPro ? (
        <svg className="w-5 h-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )}
    </div>
    <p className="text-sm text-text-secondary">{text}</p>
  </li>
);

const DeviceComparisonCard: React.FC<DeviceComparisonCardProps> = ({ device, style }) => {
  return (
    <div className="bg-base-200 rounded-xl shadow-lg overflow-hidden animate-slide-in" style={style}>
      <div className="relative">
        <img
          src={`https://picsum.photos/seed/${encodeURIComponent(device.name)}/600/400`}
          alt={device.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-base-200 to-transparent"></div>
        <h2 className="absolute bottom-0 left-0 p-6 text-2xl font-bold text-white">
          {device.name}
        </h2>
      </div>
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-brand-secondary">Specifications</h3>
          <dl className="bg-base-100/50 rounded-lg px-4">
            <SpecItem label="Display" value={device.specs.display} />
            <SpecItem label="Camera" value={device.specs.camera} />
            <SpecItem label="Processor" value={device.specs.processor} />
            <SpecItem label="Battery" value={device.specs.battery} />
            <SpecItem label="RAM" value={device.specs.ram} />
            <SpecItem label="Storage" value={device.specs.storage} />
            <SpecItem label="Price" value={device.specs.price} />
          </dl>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2 text-green-400">Pros</h3>
            <ul role="list">
              {device.pros.map((pro, index) => (
                <ProConItem key={index} text={pro} isPro={true} />
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2 text-red-400">Cons</h3>
            <ul role="list">
              {device.cons.map((con, index) => (
                <ProConItem key={index} text={con} isPro={false} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceComparisonCard;
