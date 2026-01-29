import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Upload, 
  Image as ImageIcon,
  Settings,
  BarChart3,
  BookOpen,
  Users,
  TrendingUp
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { mockSeries } from '@/lib/mockData';
import { GENRES } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function CreatorDashboard() {
  const { isAuthenticated, user } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Mock creator's series (first 3 for demo)
  const mySeries = mockSeries.slice(0, 3);

  const stats = [
    { label: 'Total Views', value: '2.5M', icon: Eye, change: '+12%' },
    { label: 'Subscribers', value: '125K', icon: Users, change: '+8%' },
    { label: 'Episodes', value: '45', icon: BookOpen, change: '+3' },
    { label: 'Avg. Rating', value: '4.8', icon: TrendingUp, change: '+0.2' },
  ];

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Creator Studio</h1>
          <p className="text-muted-foreground mb-8">
            Please login to access the creator dashboard
          </p>
          <Button asChild>
            <Link to="/login">Login</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Creator Studio</h1>
            <p className="text-muted-foreground">Manage your series and episodes</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Series
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Series</DialogTitle>
                <DialogDescription>
                  Start a new webcomic series. You can add episodes after creating the series.
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="Enter series title" />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Describe your series..." rows={3} />
                </div>
                <div>
                  <Label htmlFor="genre">Primary Genre</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENRES.map((genre) => (
                        <SelectItem key={genre.value} value={genre.value}>
                          {genre.emoji} {genre.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Cover Image</Label>
                  <div className="mt-2 border-2 border-dashed rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG up to 10MB
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" type="button" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Series</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className="w-5 h-5 text-muted-foreground" />
                    <span className="text-xs text-green-500 font-medium">{stat.change}</span>
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="series">
          <TabsList>
            <TabsTrigger value="series">My Series</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="series" className="mt-6">
            {mySeries.length > 0 ? (
              <div className="space-y-4">
                {mySeries.map((series, index) => (
                  <motion.div
                    key={series.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <img
                            src={series.coverImage}
                            alt={series.title}
                            className="w-20 h-28 object-cover rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-semibold">{series.title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant={series.status === 'ongoing' ? 'default' : 'secondary'}>
                                    {series.status}
                                  </Badge>
                                  {series.genres.slice(0, 2).map((genre) => (
                                    <Badge key={genre} variant="outline" className="text-xs">
                                      {genre}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-destructive">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              {series.description}
                            </p>
                            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                              <span>{series.episodeCount} episodes</span>
                              <span>{series.views.toLocaleString()} views</span>
                              <span>{series.subscriberCount.toLocaleString()} subscribers</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t flex gap-2">
                          <Button size="sm">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Episode
                          </Button>
                          <Button variant="outline" size="sm">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            View Analytics
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No series yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first webcomic series and start publishing
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Series
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Overview</CardTitle>
                <CardDescription>Track your performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-secondary/30 rounded-lg">
                  <p className="text-muted-foreground">
                    Analytics charts will be displayed here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Creator Settings</CardTitle>
                <CardDescription>Manage your creator profile and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="creatorName">Creator Name</Label>
                  <Input id="creatorName" defaultValue={user?.username} />
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" placeholder="Tell readers about yourself..." rows={3} />
                </div>
                <div>
                  <Label htmlFor="socialLinks">Social Links</Label>
                  <Input id="socialLinks" placeholder="Twitter, Instagram, etc." />
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
