'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { pagesAPI } from '@/lib/api';
import type { 
  FacebookPage, 
  PageInsights, 
  Post,
} from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ModernTable } from '@/components/modern/ModernTable';
import { PostEngagementChart } from '@/components/charts/PostEngagementChart';
import { EngagementOverviewChart } from '@/components/charts/EngagementOverviewChart';
import { PageMetricsChart } from '@/components/charts/PageMetricsChart';
import { EngagementTrendChart } from '@/components/charts/EngagementTrendChart';
import { EngagementRateChart } from '@/components/charts/EngagementRateChart';
import { PostPerformanceChart } from '@/components/charts/PostPerformanceChart';
import { EngagementTypeChart } from '@/components/charts/EngagementTypeChart';
import { Button } from '@/components/ui/Button';
import { 
  Users as UsersIcon, 
  Eye as EyeIcon, 
  Heart as HeartIcon, 
  TrendingUp as ArrowTrendingUpIcon,
  Download as DownloadIcon,
} from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import { Toaster, toast } from 'sonner';

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<FacebookPage | null>(null);
  const [pageInsights, setPageInsights] = useState<PageInsights | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [rawInsightsData, setRawInsightsData] = useState<any>(null);
  const [rawPostsData, setRawPostsData] = useState<any>(null);

  const exportBackendData = () => {
    const data = {
      insights: rawInsightsData,
      posts: rawPostsData,
      timestamp: new Date().toISOString()
    };
    console.log('=== BACKEND DATA EXPORT ===');
    console.log(JSON.stringify(data, null, 2));
    console.log('=== END EXPORT ===');
    
    // Also download as JSON file
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backend-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Backend data exported to console and downloaded!');
  };

  useEffect(() => {
    const session = searchParams.get('session_id');
    const storedSession = sessionStorage.getItem('session_id');
    
    if (session) {
      sessionStorage.setItem('session_id', session);
      setSessionId(session);
      loadPages(session);
    } else if (storedSession) {
      setSessionId(storedSession);
      loadPages(storedSession);
    } else {
      router.push('/');
    }
  }, [searchParams, router]);

  const loadPages = async (session: string): Promise<void> => {
    try {
      setLoading(true);
      console.log('Loading pages with session:', session);
      
      const response = await pagesAPI.getPages(session);
      console.log('Pages response:', response.data);
      
      const pagesData = response.data.pages || [];
      setPages(pagesData);
      
      console.log('Found pages:', pagesData.length);
      
      if (pagesData.length > 0) {
        setSelectedPage(pagesData[0]);
        console.log('Selected page:', pagesData[0]);
        toast.success('Connected successfully!');
      } else {
        toast.error('No Facebook pages found');
      }
    } catch (err) {
      console.error('Error loading pages:', err);
      toast.error('Failed to load pages');
      console.error('Failed to load pages:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPageData = useCallback(async (): Promise<void> => {
    if (!selectedPage || !sessionId) return;

    try {
      console.log('Loading page data for:', selectedPage.name, selectedPage.id);
      
      const [insightsRes, postsRes] = await Promise.all([
        pagesAPI.getPageInsights(selectedPage.id, sessionId, selectedPage.access_token),
        pagesAPI.getPagePosts(selectedPage.id, sessionId, 25, selectedPage.access_token),
      ]);

      console.log('Insights response:', insightsRes.data);
      console.log('Posts response:', postsRes.data);

      // Store raw data for export
      setRawInsightsData(insightsRes.data);
      setRawPostsData(postsRes.data);

      const insightsData = insightsRes.data.data || insightsRes.data;
      
      // Transform the data to match the expected structure
      const transformedInsights: PageInsights = {
        page_id: (insightsData as any).page_id,
        page_name: (insightsData as any).page_name,
        metrics: {
          followers_count: (insightsData as any).followers_count || 0,
          fan_count: (insightsData as any).fan_count || 0,
          rating: (insightsData as any).overall_star_rating || 0,
          rating_count: (insightsData as any).rating_count || 0,
        },
        page_info: {
          category: (insightsData as any).category || '',
          link: (insightsData as any).link || '',
          website: (insightsData as any).website || '',
          about: (insightsData as any).about || '',
          phone: (insightsData as any).phone || '',
        }
      };
      
      // Transform posts - use real engagement data from backend
      const transformedPosts = (postsRes.data.posts || []).map((post: any) => ({
        ...post,
        engagement: post.engagement || {
          likes: 0,
          comments: 0,
          shares: 0,
          total: 0
        }
      }));
      
      setPageInsights(transformedInsights);
      setPosts(transformedPosts);
      
      console.log('Transformed insights:', transformedInsights);
      console.log('Transformed posts:', transformedPosts);
    } catch (err) {
      console.error('Error loading page data:', err);
      toast.error('Failed to load page data');
      console.error('Failed to load page data:', err);
    }
  }, [selectedPage, sessionId]);

  useEffect(() => {
    if (selectedPage && sessionId) {
      loadPageData();
    }
  }, [selectedPage, sessionId, loadPageData]);

  if (loading) {
    return (
      <>
        <Toaster position="top-center" richColors />
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Loading dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Toaster position="top-center" richColors />
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-slate-600">Overview of your social media performance</p>
          </div>
          {rawInsightsData && (
            <Button 
              onClick={exportBackendData}
              variant="outline"
              className="flex items-center gap-2"
            >
              <DownloadIcon className="h-4 w-4" />
              Export Backend Data
            </Button>
          )}
        </div>

        {/* Debug info */}
        {!pageInsights && selectedPage && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Loading data for page: {selectedPage.name}
            </p>
          </div>
        )}

        {!selectedPage && !loading && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              No Facebook pages found. Please make sure you have admin access to at least one Facebook page.
            </p>
          </div>
        )}

        {pageInsights && pageInsights.metrics && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="shadow-none border-zinc-200">
                <CardContent className="pt-4 px-4 pb-1 sm:py-0 sm:px-4">
                  <div className="flex flex-row items-center justify-between sm:flex-col sm:items-start sm:gap-4">
                    <div className="hidden sm:flex items-center justify-between w-full text-muted-foreground pt-3">
                      <span className="text-xs uppercase font-semibold tracking-wider">Total Followers</span>
                      <UsersIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex items-center gap-3 sm:hidden min-w-0">
                      <UsersIcon className="h-6 w-6 text-blue-600 shrink-0" />
                      <span className="text-xl font-medium text-muted-foreground truncate">Followers</span>
                    </div>
                    <div className="text-3xl sm:text-2xl font-medium text-slate-900 whitespace-nowrap tabular-nums leading-none sm:pb-3">
                      {formatNumber(pageInsights.metrics.followers_count || 0)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-none border-zinc-200">
                <CardContent className="pt-4 px-4 pb-1 sm:py-0 sm:px-4">
                  <div className="flex flex-row items-center justify-between sm:flex-col sm:items-start sm:gap-4">
                    <div className="hidden sm:flex items-center justify-between w-full text-muted-foreground pt-3">
                      <span className="text-xs uppercase font-semibold tracking-wider">Page Fans</span>
                      <HeartIcon className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="flex items-center gap-3 sm:hidden min-w-0">
                      <HeartIcon className="h-6 w-6 text-red-600 shrink-0" />
                      <span className="text-xl font-medium text-muted-foreground truncate">Fans</span>
                    </div>
                    <div className="text-3xl sm:text-2xl font-medium text-slate-900 whitespace-nowrap tabular-nums leading-none sm:pb-3">
                      {formatNumber(pageInsights.metrics.fan_count || 0)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-none border-zinc-200">
                <CardContent className="pt-4 px-4 pb-1 sm:py-0 sm:px-4">
                  <div className="flex flex-row items-center justify-between sm:flex-col sm:items-start sm:gap-4">
                    <div className="hidden sm:flex items-center justify-between w-full text-muted-foreground pt-3">
                      <span className="text-xs uppercase font-semibold tracking-wider">Page Rating</span>
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex items-center gap-3 sm:hidden min-w-0">
                      <ArrowTrendingUpIcon className="h-6 w-6 text-green-600 shrink-0" />
                      <span className="text-xl font-medium text-muted-foreground truncate">Rating</span>
                    </div>
                    <div className="text-3xl sm:text-2xl font-medium text-slate-900 whitespace-nowrap tabular-nums leading-none sm:pb-3">
                      {(pageInsights.metrics.rating || 0).toFixed(1)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-none border-zinc-200">
                <CardContent className="pt-4 px-4 pb-1 sm:py-0 sm:px-4">
                  <div className="flex flex-row items-center justify-between sm:flex-col sm:items-start sm:gap-4">
                    <div className="hidden sm:flex items-center justify-between w-full text-muted-foreground pt-3">
                      <span className="text-xs uppercase font-semibold tracking-wider">Total Reviews</span>
                      <EyeIcon className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex items-center gap-3 sm:hidden min-w-0">
                      <EyeIcon className="h-6 w-6 text-purple-600 shrink-0" />
                      <span className="text-xl font-medium text-muted-foreground truncate">Reviews</span>
                    </div>
                    <div className="text-3xl sm:text-2xl font-medium text-slate-900 whitespace-nowrap tabular-nums leading-none sm:pb-3">
                      {formatNumber(pageInsights.metrics.rating_count || 0)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <PageMetricsChart metrics={pageInsights.metrics} />
              {posts.length > 0 && <EngagementOverviewChart posts={posts} />}
            </div>

            {posts.length > 0 && (
              <>
                <PostEngagementChart posts={posts} />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <EngagementTrendChart posts={posts} />
                  <EngagementRateChart 
                    posts={posts} 
                    totalFollowers={pageInsights.metrics.followers_count} 
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <PostPerformanceChart posts={posts} />
                  <EngagementTypeChart posts={posts} />
                </div>
              </>
            )}

            {posts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  <ModernTable posts={posts} />
                </CardContent>
              </Card>
            )}
          </>
        )}

        {!pageInsights && selectedPage && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600 mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Loading insights...</p>
          </div>
        )}
      </div>
    </>
  );
}
