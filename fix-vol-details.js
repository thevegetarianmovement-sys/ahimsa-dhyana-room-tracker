const fs = require('fs');
let c = fs.readFileSync('src/app/volunteers/[id]/page.tsx', 'utf8');

c = c.replace(
  "import VolunteerForm from '@/components/volunteers/VolunteerForm'",
  "import VolunteerForm from '@/components/volunteers/VolunteerForm'\nimport AssignShiftForm from '@/components/volunteers/AssignShiftForm'\nimport DeleteShiftButton from '@/components/volunteers/DeleteShiftButton'"
);

c = c.replace(
  `<VolunteerForm initialData={volunteer} />
      </div>
    </div>`,
  `<VolunteerForm initialData={volunteer} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Assign New Shift</h2>
          <AssignShiftForm volunteerId={volunteer.id} hotels={hotels} shads={shads} />
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Upcoming Shifts</h2>
          {volunteer.shifts?.length === 0 ? (
            <p className="text-slate-500 text-sm">No shifts assigned yet.</p>
          ) : (
            <div className="space-y-4">
              {volunteer.shifts?.map((shift: any) => (
                <div key={shift.id} className="border p-4 rounded bg-slate-50 flex justify-between items-center">
                  <div>
                    <p className="font-bold">{new Date(shift.date).toISOString().split('T')[0]} - {shift.shiftName}</p>
                    <p className="text-sm text-slate-600">{shift.startTime} to {shift.endTime}</p>
                    <p className="text-sm font-medium text-blue-600">{shift.hotel?.name || shift.shad?.name}</p>
                  </div>
                  <DeleteShiftButton shiftId={shift.id} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>`
);

fs.writeFileSync('src/app/volunteers/[id]/page.tsx', c);
