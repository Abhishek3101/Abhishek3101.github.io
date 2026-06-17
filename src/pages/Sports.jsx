import React, { useState, useEffect } from 'react'
import PageWrapper from '@/components/PageWrapper'
import { motion } from 'framer-motion'
import { Activity, TrendingUp, Trophy, Flame, Zap, Bike, Droplets } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'

export default function Sports() {
  const [data, setData] = useState({
    runningTotal: 0,
    cyclingTotal: 0,
    swimmingTotal: 0,
    racket: { Tennis: 0, Badminton: 0, Squash: 0, Pickleball: 0 },
    streak: 0,
    avgWater: 0,
    avgSleep: 0,
    monthlyRunning: Array(12).fill(0),
    monthlyCycling: Array(12).fill(0),
    monthlySwimming: Array(12).fill(0),
    sleepHistory: [7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7],
    heatmap: Array.from({ length: 364 }, () => 0) // 52 weeks * 7 days
  });

  useEffect(() => {
    const fetchAthletics = async () => {
      const snap = await getDocs(collection(db, 'athletics'));
      
      let rTotal = 0;
      let cTotal = 0;
      let sTotal = 0;
      let wTotal = 0;
      let wCount = 0;
      let slTotal = 0;
      let slCount = 0;
      const racket = { Tennis: 0, Badminton: 0, Squash: 0, Pickleball: 0 };
      
      const mRunning = Array(12).fill(0);
      const mCycling = Array(12).fill(0);
      const mSwimming = Array(12).fill(0);
      
      const rawSleep = [];
      
      // For heatmap & streak
      const today = new Date();
      today.setHours(0,0,0,0);
      const activityMap = {};

      snap.docs.forEach(doc => {
        const d = doc.data();
        if (!d.date) return;
        
        const dateObj = new Date(d.date);
        const month = dateObj.getMonth(); // 0-11
        
        const gym = d.gym === 'Yes';
        const run = parseFloat(d.running || '0');
        const cyc = parseFloat(d.cycling || '0');
        const swim = parseFloat(d.swimming || '0');
        const water = parseFloat(d.water || '0');
        const sleep = parseFloat(d.sleep || '0');
        const rs = d.racketSport || 'None';

        if (!isNaN(run) && run > 0) { rTotal += run; mRunning[month] += run; }
        if (!isNaN(cyc) && cyc > 0) { cTotal += cyc; mCycling[month] += cyc; }
        if (!isNaN(swim) && swim > 0) { sTotal += swim; mSwimming[month] += swim; }
        
        if (rs !== 'None' && racket[rs] !== undefined) racket[rs] += 1;
        
        if (!isNaN(water) && water > 0) { wTotal += water; wCount++; }
        if (!isNaN(sleep) && sleep > 0) { 
          slTotal += sleep; 
          slCount++; 
          rawSleep.push({ date: dateObj, sleep });
        }

        // Intensity calculation for heatmap
        let intensity = 0;
        if (gym) intensity += 2;
        if (run > 0 || cyc > 0 || swim > 0 || rs !== 'None') intensity += 2;
        if (intensity > 4) intensity = 4;
        
        const dateStr = dateObj.toISOString().split('T')[0];
        activityMap[dateStr] = Math.max(activityMap[dateStr] || 0, intensity);
      });

      // Calculate streak
      let streak = 0;
      for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const str = d.toISOString().split('T')[0];
        if (activityMap[str] && activityMap[str] > 0) {
          streak++;
        } else if (i > 0) { // allow missing today
          break;
        }
      }

      // Heatmap array (364 days ending today)
      const heatmap = [];
      for (let i = 363; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const str = d.toISOString().split('T')[0];
        heatmap.push(activityMap[str] || 0);
      }

      // Sleep history (last 12 logs)
      rawSleep.sort((a, b) => a.date - b.date);
      const sleepHistory = rawSleep.slice(-12).map(s => s.sleep);
      while(sleepHistory.length < 12) sleepHistory.unshift(7); // pad if not enough data

      setData({
        runningTotal: rTotal,
        cyclingTotal: cTotal,
        swimmingTotal: sTotal,
        racket,
        streak,
        avgWater: wCount > 0 ? (wTotal / wCount).toFixed(1) : 0,
        avgSleep: slCount > 0 ? (slTotal / slCount).toFixed(1) : 0,
        monthlyRunning: mRunning,
        monthlyCycling: mCycling,
        monthlySwimming: mSwimming,
        sleepHistory,
        heatmap
      });
    };
    
    fetchAthletics();
  }, []);

  return (
    <PageWrapper title="Athletics" fullScreen={true}>
      <div className="flex-1 h-full md:min-h-0 bg-[#f8f9fa] pt-16 pb-8 px-4 sm:px-8 lg:px-12 flex flex-col md:overflow-hidden overflow-y-auto">
        <div className="w-full max-w-[1600px] mx-auto flex flex-col h-full">
          
          {/* Header */}
          <div className="mb-6 flex justify-between items-end flex-shrink-0">
            <div>
              <h1 className="font-sans text-3xl md:text-4xl font-semibold text-zinc-900 tracking-tight mb-1">Athletics</h1>
              <p className="font-sans text-sm text-zinc-500">Real-time telemetry and physical performance.</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-zinc-200 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Live Sync Active</span>
            </div>
          </div>

          {/* Strict 6x3 Bento Grid for Single Screen */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-6 md:grid-rows-3 gap-4 min-h-0 pb-4">
            
            {/* ROW 1 */}
            
            {/* Running (col-span-2) */}
            <BentoCard className="col-span-1 md:col-span-2 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2 text-blue-600 mb-1">
                    <Activity size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Running</span>
                  </div>
                  <h2 className="text-xl font-semibold text-zinc-900">{data.runningTotal.toLocaleString()} <span className="text-sm font-normal text-zinc-500">km/yr</span></h2>
                </div>
              </div>
              <div className="flex-1 min-h-0 mt-2 min-h-[120px]">
                <BarChart data={data.monthlyRunning} color="#3b82f6" unit="km" />
              </div>
            </BentoCard>

            {/* Cycling (col-span-2) */}
            <BentoCard className="col-span-1 md:col-span-2 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2 text-emerald-600 mb-1">
                    <Bike size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Cycling</span>
                  </div>
                  <h2 className="text-xl font-semibold text-zinc-900">{data.cyclingTotal.toLocaleString()} <span className="text-sm font-normal text-zinc-500">km/yr</span></h2>
                </div>
              </div>
              <div className="flex-1 min-h-0 mt-2 min-h-[120px]">
                <BarChart data={data.monthlyCycling} color="#10b981" unit="km" />
              </div>
            </BentoCard>

            {/* Swimming (col-span-2) */}
            <BentoCard className="col-span-1 md:col-span-2 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2 text-cyan-600 mb-1">
                    <Droplets size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Swimming</span>
                  </div>
                  <h2 className="text-xl font-semibold text-zinc-900">{data.swimmingTotal.toLocaleString()} <span className="text-sm font-normal text-zinc-500">m/yr</span></h2>
                </div>
              </div>
              <div className="flex-1 min-h-0 mt-2 min-h-[120px]">
                <BarChart data={data.monthlySwimming} color="#06b6d4" unit="m" />
              </div>
            </BentoCard>

            {/* ROW 2 */}

            {/* Racket Sports Master Widget (col-span-3) */}
            <BentoCard className="col-span-1 md:col-span-3 flex flex-col">
               <div className="flex items-center gap-2 text-purple-600 mb-2 flex-shrink-0">
                 <Trophy size={14} />
                 <span className="text-[10px] font-bold uppercase tracking-widest">Racket Sports Record</span>
               </div>
               <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                  <RacketSportStats name="Tennis" games={data.racket.Tennis} color="#8b5cf6" />
                  <RacketSportStats name="Badminton" games={data.racket.Badminton} color="#ec4899" />
                  <RacketSportStats name="Squash" games={data.racket.Squash} color="#f59e0b" />
                  <RacketSportStats name="Pickleball" games={data.racket.Pickleball} color="#06b6d4" />
               </div>
            </BentoCard>

            {/* Quick Stats (col-span-1) */}
            <BentoCard className="col-span-1 md:col-span-1 flex flex-col items-center justify-evenly py-4">
               <div className="flex flex-col items-center gap-2 text-center w-full">
                 <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-500 shadow-sm border border-red-200">
                    <Flame size={16} />
                 </div>
                 <div>
                   <div className="text-xl font-semibold text-zinc-900 leading-none">{data.streak}</div>
                   <div className="text-[9px] text-zinc-500 uppercase tracking-widest mt-1">Day Streak</div>
                 </div>
               </div>
               <div className="w-12 h-px bg-zinc-200 my-2" />
               <div className="flex flex-col items-center gap-2 text-center w-full">
                 <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm border border-blue-200">
                    <Activity size={16} />
                 </div>
                 <div>
                   <div className="text-xl font-semibold text-zinc-900 leading-none">{data.avgWater} <span className="text-xs font-normal text-zinc-500">L</span></div>
                   <div className="text-[9px] text-zinc-500 uppercase tracking-widest mt-1">Avg Hydration</div>
                 </div>
               </div>
            </BentoCard>

            {/* Recovery / Sleep (col-span-2) */}
            <BentoCard className="col-span-1 md:col-span-2 flex flex-col">
              <div className="flex justify-between items-start mb-2 flex-shrink-0">
                <div>
                  <div className="flex items-center gap-2 text-indigo-500 mb-1">
                    <Activity size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Recovery (Sleep)</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-zinc-900">{data.avgSleep} <span className="text-sm font-normal text-zinc-500">hrs/night</span></h2>
                </div>
              </div>
              <div className="flex-1 min-h-0 mt-2 relative min-h-[120px]">
                <LineChart data={data.sleepHistory} color="#6366f1" />
              </div>
            </BentoCard>

            {/* ROW 3 */}

            {/* Activity Heatmap (col-span-6) */}
            <BentoCard className="col-span-1 md:col-span-6 flex flex-col min-h-[150px]">
               <div className="flex justify-between items-end mb-4 flex-shrink-0">
                 <div>
                   <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-widest">Activity Heatmap</h3>
                 </div>
                 <div className="text-xs text-zinc-500">
                   <span className="font-semibold text-zinc-900">{data.heatmap.filter(v => v > 0).length}</span> active days in past year
                 </div>
               </div>
               <div className="flex-1 w-full min-h-0 relative mt-2">
                 <div className="absolute inset-0 overflow-x-auto overflow-y-hidden hide-scrollbar">
                   <div className="min-w-full h-full pb-2">
                     <Heatmap data={data.heatmap} />
                   </div>
                 </div>
               </div>
            </BentoCard>

          </div>
        </div>
      </div>
    </PageWrapper>
  )
}

// -------------------------------------------------------------
// UI Components
// -------------------------------------------------------------

function BentoCard({ children, className = '' }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-white rounded-2xl p-4 md:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-zinc-100 ${className}`}
    >
      {children}
    </motion.div>
  )
}

// -------------------------------------------------------------
// Chart Components
// -------------------------------------------------------------

function RacketSportStats({ name, games, color }) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="w-14 h-14 sm:w-16 sm:h-16 mb-2">
         <GameCountRing games={games} color={color} />
      </div>
      <div className="text-center w-full">
        <h4 className="font-semibold text-zinc-900 mb-0.5 text-xs">{name}</h4>
        <div className="text-zinc-400 text-[9px] uppercase tracking-wider">Total Games</div>
      </div>
    </div>
  )
}

function BarChart({ data, color, unit }) {
  const max = Math.max(...data, 1) // avoid div by 0
  return (
    <div className="w-full h-full flex items-end gap-1.5">
      {data.map((value, i) => {
        const h = (value / max) * 100
        return (
          <div key={i} className="flex-1 h-full flex flex-col justify-end group relative">
            <motion.div 
              initial={{ height: "0%" }}
              whileInView={{ height: `${h}%` }}
              transition={{ duration: 0.8, delay: i * 0.05, ease: "easeOut" }}
              className="w-full rounded-t-sm transition-opacity group-hover:opacity-80"
              style={{ backgroundColor: color }}
            />
            {/* Tooltip */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              {value} {unit}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function LineChart({ data, color }) {
  const min = Math.min(...data) - 1
  const max = Math.max(...data) + 1
  const range = max - min || 1

  // Generate path
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = 100 - ((val - min) / range) * 100
    return `${x},${y}`
  }).join(' L ')
  const pathD = `M ${points}`

  return (
    <div className="w-full h-full relative mt-2 pb-2">
      <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
        <line x1="0" y1="25" x2="100" y2="25" stroke="#f4f4f5" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="#f4f4f5" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <line x1="0" y1="75" x2="100" y2="75" stroke="#f4f4f5" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        
        <motion.path 
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </svg>

      {/* HTML Absolute Points for perfect circularity and Tooltips */}
      {data.map((val, i) => {
        const x = (i / (data.length - 1)) * 100
        const y = 100 - ((val - min) / range) * 100
        return (
          <motion.div 
            key={i} 
            className="absolute w-3 h-3 bg-white border-2 rounded-full cursor-pointer group hover:scale-125 transition-transform z-20"
            style={{ 
              left: `calc(${x}% - 6px)`, 
              top: `calc(${y}% - 6px)`,
              borderColor: color
            }}
            initial={{ scale: 0 }} whileInView={{ scale: 1 }}
            transition={{ delay: 1.5 + (i * 0.05) }}
          >
            {/* Tooltip */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              {val} hrs
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

function GameCountRing({ games, color }) {
  const strokeWidth = 10
  const radius = (100 - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const dashArray = `${circumference} ${circumference}`
  
  return (
    <div className="relative w-full h-full">
      <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#f4f4f5" strokeWidth={strokeWidth} />
        <motion.circle 
          cx="50" cy="50" r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} 
          strokeDasharray={dashArray} strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base sm:text-lg font-bold text-zinc-900 leading-none">{games}</span>
      </div>
    </div>
  )
}

function Heatmap({ data }) {
  const weeks = []
  for (let i = 0; i < 52; i++) {
    weeks.push(data.slice(i * 7, (i + 1) * 7))
  }
  const getColor = (val) => {
    if (val === 0) return '#f4f4f5'
    if (val === 1) return '#dcfce7'
    if (val === 2) return '#86efac'
    if (val === 3) return '#22c55e'
    return '#166534'
  }
  return (
    <div className="flex gap-1 sm:gap-1.5 justify-between w-full h-full">
      {weeks.map((week, wIdx) => (
        <div key={wIdx} className="flex flex-col gap-1 sm:gap-1.5 h-full justify-between flex-1">
          {week.map((dayVal, dIdx) => (
            <div key={dIdx} className="w-full flex-1 relative group">
              <motion.div 
                className="w-full h-full rounded-[2px]"
                style={{ backgroundColor: getColor(dayVal) }}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: (wIdx * 0.01) + (dIdx * 0.005) }}
              />
              {/* Tooltip */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                Level {dayVal}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
