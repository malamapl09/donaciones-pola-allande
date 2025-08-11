import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

interface ContentSection {
  section: string;
  title: string;
  content: string;
  displayOrder: number;
  isActive: boolean;
}

const ContentManager: React.FC = () => {
  const [contentSections, setContentSections] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<ContentSection | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await api.get('/admin/content');
      setContentSections(response.data.sections || []);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (section: ContentSection) => {
    setEditingSection({ ...section });
  };

  const handleSave = async () => {
    if (!editingSection) return;
    
    setSaving(true);
    try {
      await api.put('/admin/content', editingSection);
      await fetchContent();
      setEditingSection(null);
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Error al guardar el contenido');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingSection(null);
  };

  const handleInputChange = (field: keyof ContentSection, value: string | number | boolean) => {
    if (!editingSection) return;
    setEditingSection({
      ...editingSection,
      [field]: value
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pola-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Contenido</h1>
          <p className="text-gray-600">
            Edita el contenido del sitio web del evento
          </p>
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-6">
        {contentSections.map((section, index) => (
          <div key={section.section} className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                <p className="text-sm text-gray-500">Sección: {section.section}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  section.isActive 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {section.isActive ? 'Activo' : 'Inactivo'}
                </span>
                <button
                  onClick={() => handleEdit(section)}
                  className="btn-secondary text-sm"
                >
                  Editar
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-700 whitespace-pre-wrap">
                {section.content.length > 300 
                  ? `${section.content.substring(0, 300)}...` 
                  : section.content
                }
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingSection && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Editar: {editingSection.title}
                </h3>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="label">Título</label>
                  <input
                    type="text"
                    value={editingSection.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="label">Contenido</label>
                  <textarea
                    rows={12}
                    value={editingSection.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    className="input-field font-mono text-sm"
                    placeholder="Puedes usar texto plano o HTML básico..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Orden de visualización</label>
                    <input
                      type="number"
                      value={editingSection.displayOrder}
                      onChange={(e) => handleInputChange('displayOrder', parseInt(e.target.value))}
                      className="input-field"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={editingSection.isActive}
                      onChange={(e) => handleInputChange('isActive', e.target.checked)}
                      className="w-4 h-4 text-pola-blue focus:ring-pola-blue border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 text-gray-700">
                      Sección activa (visible en el sitio)
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={handleCancel}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`btn-primary ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentManager;