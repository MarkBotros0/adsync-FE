'use client';

import { motion } from 'framer-motion';
import { Post } from '@/lib/types';
import { formatDate, formatNumber } from '@/lib/utils';
import { HeartIcon, ChatBubbleLeftIcon, ShareIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

interface ModernTableProps {
  posts: Post[];
}

export function ModernTable({ posts }: ModernTableProps) {
  if (posts.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 border border-slate-200/60 shadow-lg text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
          <ChatBubbleLeftIcon className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-slate-600 font-medium">No posts found</p>
        <p className="text-sm text-slate-500 mt-1">Posts will appear here once available</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-lg overflow-hidden"
    >
      <div className="px-6 py-5 border-b border-slate-200/60">
        <h3 className="text-xl font-bold text-slate-900">Recent Posts</h3>
        <p className="text-sm text-slate-600 mt-1">Your latest social media content performance</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Content
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Engagement
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/60">
            {posts.map((post, index) => (
              <motion.tr
                key={post.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="hover:bg-slate-50/50 transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="max-w-md">
                    <p className="text-sm font-medium text-slate-900 line-clamp-2">
                      {post.message || 'No message'}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-slate-600">{formatDate(post.created_time)}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-1.5 text-rose-600">
                      <HeartIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">{formatNumber(post.engagement?.likes || 0)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-blue-600">
                      <ChatBubbleLeftIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">{formatNumber(post.engagement?.comments || 0)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-green-600">
                      <ShareIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">{formatNumber(post.engagement?.shares || 0)}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  {post.permalink_url && (
                    <a
                      href={post.permalink_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors"
                    >
                      View
                      <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                    </a>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
