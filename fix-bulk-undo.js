const fs = require('fs');
const path = 'src/components/hotels/RoomList.tsx';
let content = fs.readFileSync(path, 'utf8');

const handleBulkUndo = `
  const handleBulkUndo = async () => {
    if (undoCart.length === 0) return;
    if (!confirm(\`Are you sure you want to completely erase \${undoCart.length} assignments? This cannot be undone.\`)) return;
    
    try {
      setRegistering(true);
      await fetch('/api/allocations/bulk-undo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          allocationIds: undoCart,
          locationId: hotelId,
          type: 'HOTEL'
        })
      });
      setUndoCart([]);
      setUndoMode(false);
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert('Failed to undo assignments');
      setRegistering(false);
    }
  };
`;

content = content.replace(
  /async function handleCheckOut\(allocId: string\) \{/,
  `${handleBulkUndo.trim()}\n\n  async function handleCheckOut(allocId: string) {`
);

fs.writeFileSync(path, content);
console.log('Injected handleBulkUndo');
