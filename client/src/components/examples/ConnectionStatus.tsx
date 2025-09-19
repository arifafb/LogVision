import ConnectionStatus from '../ConnectionStatus';

export default function ConnectionStatusExample() {
  return (
    <div className="space-y-4 p-4">
      <ConnectionStatus 
        isConnected={true} 
        isStreaming={true}
        lastUpdateTime={new Date()}
      />
      
      <ConnectionStatus 
        isConnected={true} 
        isStreaming={false}
        lastUpdateTime={new Date(Date.now() - 30000)}
      />
      
      <ConnectionStatus 
        isConnected={false} 
        isStreaming={false}
      />
    </div>
  );
}