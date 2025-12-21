import React from 'react';
import { Save } from 'lucide-react';

const AddNoteForm = ({ 
    noteTitle, 
    noteDescription, 
    onTitleChange, 
    onDescriptionChange, 
    onSubmit 
}) => {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">New Clinical Note</h3>
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="block text-lg font-medium text-gray-700 mb-1">Title</label>
                    <input
                        type="text"
                        value={noteTitle}
                        onChange={(e) => onTitleChange(e.target.value)}
                        className="w-full rounded-lg p-3 border-gray-300 shadow-sm focus:border-[#00a896] focus:ring-[#00a896]"
                        placeholder="e.g. Follow-up Consultation"
                        required
                    />
                </div>
                <div>
                    <label className="block text-lg font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        value={noteDescription}
                        onChange={(e) => onDescriptionChange(e.target.value)}
                        rows={3}
                        className="w-full rounded-lg p-3 border-gray-300 shadow-sm focus:border-[#00a896] focus:ring-[#00a896]"
                        placeholder="Enter clinical observations..."
                        required
                    />
                </div>
                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="px-4 cursor-pointer py-2 bg-[#00a896] text-white rounded-lg hover:bg-[#028090] flex items-center text-lg"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Save Note
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddNoteForm;