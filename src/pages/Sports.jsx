import React, { useState, useEffect } from 'react'
import PageWrapper from '@/components/PageWrapper'
import { motion } from 'framer-motion'
import { Activity, Flame, Zap, Bike, Droplets } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs, addDoc } from 'firebase/firestore'

export default function Sports() {
  const [data, setData] = useState({
    runningTotal: 0,
    cyclingTotal: 0,
    swimmingTotal: 0,
    racket: { Tennis: 0, Badminton: 0, Squash: 0, Pickleball: 0 },
    runningSessions: [],
    cyclingSessions: [],
    swimmingSessions: [],
    memories: []
  });

  useEffect(() => {
    const fetchAthletics = async () => {
      let snap = await getDocs(collection(db, 'athletics'));
      
      // Seed dummy data if empty to give the user the experience
      if (snap.empty) {
        const dummyData = [
          { date: '2023-10-01', running: 5, journal: 'First crisp autumn morning run. The leaves were incredible.' },
          { date: '2023-10-05', cycling: 20, gym: 'Yes', journal: 'Tough ride up the hills, but hit a PR. Gym session afterwards was a struggle.' },
          { date: '2023-10-12', racketSport: 'Tennis', journal: 'Played a 3-set thriller with John. Backhand is finally feeling natural again.' },
          { date: '2023-10-20', swimming: 1500, journal: 'Felt very calm in the water today. Good pacing.' }
        ];
        for (const d of dummyData) {
          await addDoc(collection(db, 'athletics'), d);
        }
        snap = await getDocs(collection(db, 'athletics'));
      }
      
      let rTotal = 0; let cTotal = 0; let sTotal = 0;
      const racket = { Tennis: 0, Badminton: 0, Squash: 0, Pickleball: 0 };
      
      const rawRunning = [];
      const rawCycling = [];
      const rawSwimming = [];
      const memories = [];

      snap.docs.forEach(doc => {
        const d = doc.data();
        if (!d.date) return;
        
        const dateObj = new Date(d.date);
        
        const run = parseFloat(d.running || '0');
        const cyc = parseFloat(d.cycling || '0');
        const swim = parseFloat(d.swimming || '0');
        const rs = d.racketSport || 'None';
        const journal = d.journal || '';
        const image = d.image || null;

        if (!isNaN(run) && run > 0) { rTotal += run; rawRunning.push({ date: dateObj, value: run }); }
        if (!isNaN(cyc) && cyc > 0) { cTotal += cyc; rawCycling.push({ date: dateObj, value: cyc }); }
        if (!isNaN(swim) && swim > 0) { sTotal += swim; rawSwimming.push({ date: dateObj, value: swim }); }
        
        if (rs !== 'None' && racket[rs] !== undefined) racket[rs] += 1;
        
        if (journal.trim() || image) {
          memories.push({ date: dateObj, text: journal, rs, run, cyc, swim, image });
        }
      });

      memories.sort((a, b) => b.date - a.date);

      const processSessions = (arr) => {
        arr.sort((a, b) => a.date - b.date);
        return arr.slice(-14).map(item => ({
          date: item.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          value: item.value
        }));
      };

      setData({
        runningTotal: rTotal, cyclingTotal: cTotal, swimmingTotal: sTotal,
        racket,
        runningSessions: processSessions(rawRunning),
        cyclingSessions: processSessions(rawCycling),
        swimmingSessions: processSessions(rawSwimming),
        memories
      });
    };
    
    fetchAthletics();
  }, []);

  return (
    <PageWrapper title="Training Log" fullScreen={true}>
      {/* Background Table Texture */}
      <div className="flex-1 h-full bg-[#d6c7b5] md:p-8 lg:p-12 overflow-y-auto flex justify-center perspective-1000">
        
        {/* The Physical Logbook */}
        <motion.div 
          initial={{ rotateX: 5, y: 50, opacity: 0 }}
          animate={{ rotateX: 0, y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-[1200px] bg-[#fcfaf5] shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-r-2xl rounded-l-md relative flex flex-col md:flex-row border border-[#e6decb]"
          style={{ backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0.05) 0%, transparent 2%, transparent 98%, rgba(0,0,0,0.05) 100%)' }}
        >
          {/* Leather Spine */}
          <div className="hidden md:block absolute left-0 top-0 bottom-0 w-12 bg-[#3a2818] shadow-[inset_-5px_0_15px_rgba(0,0,0,0.8)] z-20 rounded-l-md border-r border-[#1a110a]">
            {/* Binding details */}
            <div className="w-full h-px bg-white/10 mt-12" />
            <div className="w-full h-px bg-white/10 mt-24" />
            <div className="w-full h-px bg-white/10 mt-36" />
          </div>

          {/* Left Page (Cardio & Heatmap) */}
          <div className="w-full md:w-1/2 p-8 md:pl-20 md:pr-12 relative border-b md:border-b-0 md:border-r border-[#e6decb]">
            <h1 className="font-handwriting text-5xl text-[#2a221b] mb-2 transform -rotate-1">Athletics Log</h1>
            <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest mb-10 border-b border-gray-300 pb-2">Volume I - Physical Telemetry</p>
            
            {/* Scrapbook Polaroids for Cardio */}
            <div className="flex flex-col gap-8 mb-12">
              
              {/* Running Note */}
              <div className="relative group">
                <div className="absolute -left-4 -top-4 w-8 h-8 opacity-40">
                  <svg viewBox="0 0 100 100"><path d="M10,50 Q50,10 90,50 T10,50" fill="none" stroke="#2563eb" strokeWidth="2" className="animate-pulse" /></svg>
                </div>
                <h3 className="font-handwriting text-2xl text-[#1e3a8a] mb-2 flex items-center gap-2">
                  <Activity size={20} className="stroke-2" /> Running - {data.runningTotal} km
                </h3>
                <div className="h-24 bg-white p-2 shadow-sm border border-gray-200 transform rotate-1">
                  <HandDrawnBarChart data={data.runningSessions} color="#1e3a8a" unit="km" />
                </div>
                <div className="font-handwriting text-sm text-gray-500 mt-2 rotate-[-1deg]">Consistent pacing this year. Need to stretch more.</div>
              </div>

              {/* Cycling Note */}
              <div className="relative group">
                <h3 className="font-handwriting text-2xl text-[#065f46] mb-2 flex items-center gap-2">
                  <Bike size={20} className="stroke-2" /> Cycling - {data.cyclingTotal} km
                </h3>
                <div className="h-24 bg-white p-2 shadow-sm border border-gray-200 transform -rotate-1">
                  <HandDrawnBarChart data={data.cyclingSessions} color="#065f46" unit="km" />
                </div>
              </div>

              {/* Swimming Note */}
              <div className="relative group">
                <h3 className="font-handwriting text-2xl text-[#0891b2] mb-2 flex items-center gap-2">
                  <Droplets size={20} className="stroke-2" /> Swimming - {data.swimmingTotal} m
                </h3>
                <div className="h-24 bg-white p-2 shadow-sm border border-gray-200 transform rotate-1">
                  <HandDrawnBarChart data={data.swimmingSessions} color="#0891b2" unit="m" />
                </div>
              </div>

              {/* Racket Sports Sticky Note */}
              <div className="bg-[#fef9c3] p-4 shadow-sm transform -rotate-1 w-full max-w-[280px] mt-4"
                   style={{ clipPath: 'polygon(0 0, 100% 0, 100% 90%, 90% 100%, 0 100%)' }}>
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-3 bg-red-500/20 shadow-sm transform rotate-2" /> {/* Tape */}
                <h3 className="font-handwriting text-2xl text-gray-900 mb-2 border-b border-gray-300/50 pb-1">Racket Games</h3>
                <ul className="font-handwriting text-lg text-gray-800 space-y-2">
                  <li className="flex justify-between"><span>Tennis</span> <span>{data.racket.Tennis} matches</span></li>
                  <li className="flex justify-between"><span>Badminton</span> <span>{data.racket.Badminton} matches</span></li>
                  <li className="flex justify-between"><span>Squash</span> <span>{data.racket.Squash} matches</span></li>
                  <li className="flex justify-between"><span>Pickleball</span> <span>{data.racket.Pickleball} matches</span></li>
                </ul>
              </div>

            </div>

            </div>

          {/* Right Page (Racket Sports, Sleep, Streaks) */}
          <div className="w-full md:w-1/2 p-8 md:pl-12 md:pr-16 relative">
            {/* Red margin line like notebook paper */}
            <div className="hidden md:block absolute left-8 top-0 bottom-0 w-px bg-red-400/50" />
            
              {/* Field Notes & Memories */}
              <div className="mt-2 relative flex-1 flex flex-col h-full">
                 <h3 className="font-handwriting text-3xl text-gray-800 mb-6 border-b border-gray-300 pb-2">Field Notes</h3>
                 <div className="flex-1 overflow-y-auto hide-scrollbar space-y-8 pr-4">
                    {data.memories.map((mem, i) => (
                      <div key={i} className="relative group pl-4 border-l-2 border-red-300/50">
                        <div className="font-mono text-[10px] text-gray-400 mb-2 tracking-widest uppercase">
                          {mem.date.toLocaleDateString()}
                          {(mem.run > 0 || mem.cyc > 0 || mem.swim > 0 || mem.rs !== 'None') && ' • '}
                          {[mem.run > 0 && `${mem.run}km Run`, mem.cyc > 0 && `${mem.cyc}km Ride`, mem.swim > 0 && `${mem.swim}m Swim`, mem.rs !== 'None' && mem.rs].filter(Boolean).join(', ')}
                        </div>
                        <div className="font-handwriting text-2xl text-[#3a2818] leading-relaxed">
                          "{mem.text}"
                        </div>
                        {mem.image && (
                          <div className="mt-4 relative inline-block transform rotate-1 hover:rotate-0 transition-transform">
                            <div className="bg-white p-2 pb-6 shadow-md border border-gray-200">
                              <img src={mem.image} alt="Memory" className="w-full max-w-[200px] h-auto object-cover border border-gray-100" />
                            </div>
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-3 bg-red-500/20 shadow-sm transform -rotate-2" />
                          </div>
                        )}
                      </div>
                    ))}
                    {data.memories.length === 0 && (
                      <div className="font-handwriting text-2xl text-gray-400 italic mt-4">No field notes recorded yet...</div>
                    )}
                 </div>
              </div>

            </div>

        </motion.div>
      </div>
    </PageWrapper>
  )
}

// -------------------------------------------------------------
// Hand-Drawn Chart Components
// -------------------------------------------------------------

function HandDrawnBarChart({ data, color, unit }) {
  if (!data || data.length === 0) {
    return <div className="w-full h-full flex items-center justify-center font-handwriting text-gray-400">No recent sessions</div>;
  }
  
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="w-full h-full flex items-end gap-2">
      {data.map((item, i) => {
        const h = (item.value / max) * 100
        // Add random slight height jitter and rotation for hand-drawn feel
        const rot = (Math.random() * 2 - 1)
        return (
          <div key={i} className="flex-1 h-full flex flex-col justify-end group relative items-center">
            <motion.div 
              initial={{ height: "0%" }}
              whileInView={{ height: `${h}%` }}
              transition={{ duration: 0.8, delay: i * 0.05 }}
              className="w-full rounded-sm opacity-80 group-hover:opacity-100"
              style={{ backgroundColor: color, transform: `rotate(${rot}deg)` }}
            />
            <div className="absolute -top-10 bg-[#fcfaf5] border border-gray-300 text-gray-800 font-handwriting text-sm px-2 py-0.5 shadow-sm opacity-0 group-hover:opacity-100 pointer-events-none z-10 transform -rotate-2 whitespace-nowrap flex flex-col items-center">
              <span>{item.value} {unit}</span>
              <span className="text-[10px] text-gray-500 font-sans tracking-wide leading-none">{item.date}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}


