'use client';

import { useState, useEffect, use } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { Course, CourseContent, ContentType } from '@/types';
import { ArrowLeft, Plus, Folder, FileText, CheckSquare, Pencil, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';

interface ContentNodeProps {
  node: CourseContent;
  onEdit: (node: CourseContent) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
  level?: number;
}

function ContentNode({ node, onEdit, onDelete, onAddChild, level = 0 }: ContentNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const getIcon = (type: ContentType) => {
    switch (type) {
      case 'section': return <Folder className="h-4 w-4 text-blue-500" />;
      case 'lesson': return <FileText className="h-4 w-4 text-green-500" />;
      case 'assessment': return <CheckSquare className="h-4 w-4 text-purple-500" />;
    }
  };

  return (
    <div className="space-y-1">
      <div 
        className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 group transition-colors"
        style={{ marginLeft: `${level * 20}px` }}
      >
        <div className="flex items-center gap-2 flex-1">
          {node.contentType === 'section' ? (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          ) : (
            <div className="w-6" />
          )}
          {getIcon(node.contentType)}
          <span className="font-medium text-sm">{node.topic}</span>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {node.contentType === 'section' && (
            <Button variant="ghost" size="sm" onClick={() => onAddChild(node.id)}>
              <Plus className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => onEdit(node)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(node.id)} className="text-red-600">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {isExpanded && node.children && node.children.length > 0 && (
        <div className="space-y-1">
          {node.children.map(child => (
            <ContentNode 
              key={child.id} 
              node={child} 
              onEdit={onEdit} 
              onDelete={onDelete} 
              onAddChild={onAddChild} 
              level={level + 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CourseContentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [course, setCourse] = useState<Course | null>(null);
  const [contents, setContents] = useState<CourseContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<CourseContent | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    topic: '',
    contentType: 'section' as ContentType,
  });

  const fetchCourseData = async () => {
    try {
      setIsLoading(true);
      const [courseRes, contentsRes] = await Promise.all([
        api.get<Course>(`/courses/${id}`),
        api.get<CourseContent[]>(`/courses/${id}/contents`),
      ]);
      setCourse(courseRes);
      setContents(contentsRes);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingNode) {
        await api.put(`/courses/contents/${editingNode.id}`, formData);
      } else {
        await api.post(`/courses/${id}/contents`, {
          ...formData,
          parentId,
        });
      }
      setIsModalOpen(false);
      setEditingNode(null);
      setParentId(null);
      setFormData({ topic: '', contentType: 'section' });
      fetchCourseData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (contentId: string) => {
    if (!confirm('Are you sure you want to delete this item? This will also delete all sub-items.')) return;
    try {
      await api.delete(`/courses/contents/${contentId}`);
      fetchCourseData();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/courses" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{course?.title}</h1>
              <p className="text-sm text-gray-500">Manage course structure and content</p>
            </div>
          </div>
          <Button onClick={() => {
            setEditingNode(null);
            setParentId(null);
            setFormData({ topic: '', contentType: 'section' });
            setIsModalOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Root Section
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Content Tree</CardTitle>
            <CardDescription>Drag and drop support coming soon</CardDescription>
          </CardHeader>
          <CardContent>
            {contents.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                <Folder className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No content added yet</p>
                <Button variant="ghost" className="mt-4" onClick={() => setIsModalOpen(true)}>
                  Add your first section
                </Button>
              </div>
            ) : (
              <div className="space-y-1">
                {contents.map(node => (
                  <ContentNode 
                    key={node.id} 
                    node={node} 
                    onEdit={(n) => {
                      setEditingNode(n);
                      setFormData({ topic: n.topic, contentType: n.contentType });
                      setIsModalOpen(true);
                    }} 
                    onDelete={handleDelete} 
                    onAddChild={(pid) => {
                      setParentId(pid);
                      setEditingNode(null);
                      setFormData({ topic: '', contentType: 'lesson' });
                      setIsModalOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md animate-in zoom-in-95 duration-200">
            <CardHeader>
              <CardTitle>{editingNode ? 'Edit Content' : 'Add Content'}</CardTitle>
              {parentId && <CardDescription>Adding child to selected section</CardDescription>}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Topic Name"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="e.g. Introduction, Quiz #1"
                  required
                />
                
                {!editingNode && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Content Type</label>
                    <select
                      value={formData.contentType}
                      onChange={(e) => setFormData({ ...formData, contentType: e.target.value as ContentType })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="section">Section (Folder)</option>
                      <option value="lesson">Lesson (Material)</option>
                      <option value="assessment">Assessment (Quiz/Challenge)</option>
                    </select>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingNode ? 'Save Changes' : 'Add Content'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
