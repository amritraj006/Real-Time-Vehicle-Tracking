import React from 'react'
import { useState } from 'react';
import { Edit, Locate, Share, TrainTrackIcon, Zap } from 'lucide-react';
import Title from './Title';

const Features = () => {
    const [isHover, setIsHover] = useState(false);
      return (
        <div id='features' className='flex flex-col items-center my-10 scroll-mt-12'> 


        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-400/10 rounded-full px-6 py-1.5">
            <Zap width={14} />
            <span>Real-Time Technology</span>
        </div>

        <Title 
          title='Smart Vehicle Tracking' 
          description='Our advanced system lets you monitor vehicle locations, driver behavior, and routes in real time with interactive live maps.' 
        />

            <div className="flex flex-col md:flex-row items-center justify-center">
                <img className="max-w-2xl w-full xl:-ml-32" src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/features/group-image-1.png" alt="" />
                <div className="px-4 md:px-0" onMouseEnter={() => setIsHover(true)} onMouseLeave={() => setIsHover(false)}>
                    <div className={"flex items-center justify-center gap-6 max-w-md group cursor-pointer"}>
                        <div className={`p-6 group-hover:bg-violet-100 border border-transparent group-hover:border-violet-300  flex gap-4 rounded-xl transition-colors ${!isHover ? 'border-violet-300 bg-violet-100' : ''}`}>

                            <Locate className='size-6 stroke-green-600' />
                            <div className="space-y-2">
                                <h3 className="text-base font-semibold text-slate-700">Live Vehicle Tracking</h3>
                                <p className="text-sm text-slate-600 max-w-xs">Track vehicles in real-time with accurate GPS updates and map visualization.</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-6 max-w-md group cursor-pointer">
                        <div className="p-6 group-hover:bg-green-100 border border-transparent group-hover:border-green-300 flex gap-4 rounded-xl transition-colors">
                            <Edit className='size-6 stroke-green-600' />
                            <div className="space-y-2">
                                <h3 className="text-base font-semibold text-slate-700">Secure Data Management</h3>
                                <p className="text-sm text-slate-600 max-w-xs">All user and vehicle data is securely encrypted to ensure privacy and safety.</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-6 max-w-md group cursor-pointer">
                        <div className="p-6 group-hover:bg-orange-100 border border-transparent group-hover:border-orange-300 flex gap-4 rounded-xl transition-colors">
                            <Share className='size-6 stroke-orange-600' />
                            <div className="space-y-2">
                                <h3 className="text-base font-semibold text-slate-700">Share Live Location</h3>
                                <p className="text-sm text-slate-600 max-w-xs">Easily share your vehicle’s live location via WhatsApp, Instagram, or other platforms.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
            
                * {
                    font-family: 'Poppins', sans-serif;
                }
            `}</style>
        </div>
    );
}

export default Features;
