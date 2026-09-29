const fs = require('fs');

const file = 'src/components/shads/ShadBedList.tsx';
let content = fs.readFileSync(file, 'utf8');

const stateInject = `  const [familyMode, setFamilyMode] = useState(false);
  const [familyCart, setFamilyCart] = useState<string[]>([]);
  const [autoFamilyModal, setAutoFamilyModal] = useState(false);
  const [manualFamilyModal, setManualFamilyModal] = useState(false);
  const [familyData, setFamilyData] = useState({ name: '', phone: '', gender: '', checkOutDate: '', autoCount: '' });

  const handleBedClick = (bed: any, room: any) => {
    if (familyMode) {
      if (bed.allocations.length > 0) return; // Ignore occupied beds
      if (familyCart.includes(bed.id)) {
        setFamilyCart(familyCart.filter(id => id !== bed.id));
      } else {
        setFamilyCart([...familyCart, bed.id]);
      }
    } else {
      setSelectedBed({ ...bed });
    }
  };

  const submitFamilyBooking = async (type: 'AUTO' | 'MANUAL') => {
    setRegistering(true);
    try {
      const payload = {
        data: {
          name: familyData.name,
          phone: familyData.phone,
          gender: familyData.gender,
          checkOutDate: familyData.checkOutDate
        },
        locationId: shadId,
        type: 'SHAD',
        bookingParams: {
          autoCount: type === 'AUTO' ? parseInt(familyData.autoCount) : undefined,
          bedIds: type === 'MANUAL' ? familyCart : undefined
        }
      };

      const res = await fetch(\`\${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/allocations/family-book\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Error booking family');
      }
      setAutoFamilyModal(false);
      setManualFamilyModal(false);
      setFamilyMode(false);
      setFamilyCart([]);
      setFamilyData({ name: '', phone: '', gender: '', checkOutDate: '', autoCount: '' });
      router.refresh();
    } catch (e: any) {
      console.error(e);
      alert(e.message);
    } finally {
      setRegistering(false);
    }
  };
`;

content = content.replace(
  /const \[regData, setRegData\] = useState\(\{ name: '', phone: '', registrationNumber: '', checkOutDate: '', gender: '' \}\)/,
  "const [regData, setRegData] = useState({ name: '', phone: '', registrationNumber: '', checkOutDate: '', gender: '' })\n" + stateInject
);

fs.writeFileSync(file, content);
