'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { 
  ArrowLeft, 
  BookOpen, 
  Users, 
  GraduationCap, 
  Save, 
  Trash2,
  Plus,
  Folder,
  FileText,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  Edit2,
  MoreVertical
} from 'lucide-react';
import type { Course, CourseContent, ContentType } from '@/types';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [contents, setContents] = useState<CourseContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'content' | 'enrollments'>('details');
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficultyLevel: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
  });

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const [courseData, contentData] = await Promise.all([
        api.get<Course>(`/courses/${courseId}`),
        api.get<CourseContent[]>(`/courses/${courseId}/content`),
      ]);
      setCourse(courseData);
      setContents(contentData);
      setFormData({
        title: courseData.title,
        description: courseData.description || '',
        difficultyLevel: courseData.difficultyLevel,
      });
    } catch (error) {
      console.error('Failed to fetch course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch(`/courses/${courseId}`, formData);
      setCourse(prev => prev ? { ...prev, ...formData } : null);
    } catch (error) {
      console.error('Failed to save course:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      await api.del(`/courses/${courseId}`);
      router.push('/admin/courses');
    } catch (error) {
      console.error('Failed to delete course:', error);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getContentIcon = (type: ContentType) => {
    switch (type) {
      case 'section': return <Folder className="h-4 w-4 text-blue-500" />;
      case 'lesson': return <FileText className="h-4 w-4 text-green-500" />;
      case 'assessment': return <HelpCircle className="h-4 w-4 text-purple-500" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Course not found</h3>
          <Link href="/admin/courses">
            <Button className="mt-4">Back to Courses</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/courses">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
              <p className="text-gray-500">Manage course details and content</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleSave} 
              isLoading={saving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
            <Button 
              variant="outline" 
              className="text-red-600 hover:bg-red-50 border-red-200"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex items-center gap-4 py-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Folder className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{contents.length}</p>
                <p className="text-sm text-gray-500">Content Items</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 py-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{course.enrolledCount || 0}</p>
                <p className="text-sm text-gray-500">Enrolled</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 py-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <GraduationCap className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(course.difficultyLevel)}`}>
                  {course.difficultyLevel}
                </span>
                <p className="text-sm text-gray-500 mt-1">Difficulty</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-8">
            {[
              { id: 'details', label: 'Course Details', icon: BookOpen },
              { id: 'content', label: 'Content Tree', icon: Folder },
              { id: 'enrollments', label: 'Enrollments', icon: Users },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'details' && (
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <Input
                  label="Course Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.difficultyLevel}
                    onChange={(e) => setFormData({ ...formData, difficultyLevel: e.target.value as typeof formData.difficultyLevel })}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'content' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Course Content</CardTitle>
              <Link href={`/admin/courses/${courseId}/content/new`}>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Content
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {contents.length === 0 ? (
                <div className="text-center py-8">
                  <Folder className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-2 text-gray-500">No content yet. Add your first section or lesson.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {contents.map((content) => (
                    <ContentItem key={content.id} content={content} courseId={courseId} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'enrollments' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Enrolled Learners</CardTitle>
              <Link href={`/admin/courses/${courseId}/enroll`}>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Enroll Learners
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-center py-8">
                Enrollments management coming soon. Use the &quot;Enroll Learners&quot; button to add students.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

function ContentItem({ content, courseId, level = 0 }: { content: CourseContent; courseId: string; level?: number }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = content.children && content.children.length > 0;
  const router = useRouter();

  const getContentIcon = (type: ContentType) => {
    switch (type) {
      case 'section': return <Folder className="h-4 w-4 text-blue-500" />;
      case 'lesson': return <FileText className="h-4 w-4 text-green-500" />;
      case 'assessment': return <HelpCircle className="h-4 w-4 text-purple-500" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div>
      <div 
        className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 group cursor-pointer"
        style={{ paddingLeft: `${level * 24 + 12}px` }}
      >
        {hasChildren && (
          <button 
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="p-1 hover:bg-gray-200 rounded"
          >
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        )}
        {!hasChildren && <span className="w-6" />}
        
        {getContentIcon(content.contentType)}
        <span className="flex-1 text-sm font-medium">{content.topic}</span>
        
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => { e.stopPropagation(); router.push(`/admin/courses/${courseId}/content/${content.id}/edit`); }}
          >
            <Edit2 className="h-3 w-3" />
          </Button>
          {content.contentType === 'section' && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => { e.stopPropagation(); router.push(`/admin/courses/${courseId}/content/new?parentId=${content.id}`); }}
            >
              <Plus className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
      
      {expanded && hasChildren && (
        <div>
          {content.children.map((child) => (
            <ContentItem key={child.id} content={child} courseId={courseId} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
