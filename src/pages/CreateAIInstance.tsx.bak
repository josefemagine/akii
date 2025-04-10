import React from 'react';

export default function CreateAIInstance() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Create AI Instance</h1>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Configure and deploy your own private AI instance.
        </p>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Instance Name
            </label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white" 
              placeholder="My AI Assistant"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Base Model
            </label>
            <select className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white">
              <option>Claude 3 Opus</option>
              <option>Claude 3 Sonnet</option>
              <option>Claude 3 Haiku</option>
              <option>GPT-4o</option>
              <option>GPT-4 Turbo</option>
            </select>
          </div>
          
          <div className="pt-4">
            <button 
              type="submit" 
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-md transition-colors border-0"
            >
              Create Instance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 