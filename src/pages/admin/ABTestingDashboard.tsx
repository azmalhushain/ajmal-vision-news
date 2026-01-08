import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { FlaskConical, Plus, Eye, MousePointer, Trophy, Loader2, Play, Square, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface ABTest {
  id: string;
  test_name: string;
  variant_a_subject: string;
  variant_b_subject: string;
  variant_a_sent_count: number;
  variant_b_sent_count: number;
  variant_a_open_count: number;
  variant_b_open_count: number;
  variant_a_click_count: number;
  variant_b_click_count: number;
  status: string;
  winning_variant: string | null;
  created_at: string;
  completed_at: string | null;
}

const ABTestingDashboard = () => {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTest, setNewTest] = useState({
    test_name: "",
    variant_a_subject: "",
    variant_b_subject: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    const { data, error } = await supabase
      .from("email_ab_tests")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setTests(data || []);
    }
    setLoading(false);
  };

  const handleCreateTest = async () => {
    if (!newTest.test_name || !newTest.variant_a_subject || !newTest.variant_b_subject) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }

    setCreating(true);
    const { error } = await supabase.from("email_ab_tests").insert({
      test_name: newTest.test_name,
      variant_a_subject: newTest.variant_a_subject,
      variant_b_subject: newTest.variant_b_subject,
    });

    if (error) {
      toast({ title: "Failed to create test", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "A/B test created!" });
      setNewTest({ test_name: "", variant_a_subject: "", variant_b_subject: "" });
      setDialogOpen(false);
      fetchTests();
    }
    setCreating(false);
  };

  const completeTest = async (test: ABTest) => {
    const openRateA = test.variant_a_sent_count > 0 
      ? (test.variant_a_open_count / test.variant_a_sent_count) * 100 
      : 0;
    const openRateB = test.variant_b_sent_count > 0 
      ? (test.variant_b_open_count / test.variant_b_sent_count) * 100 
      : 0;
    
    const winner = openRateA > openRateB ? "A" : openRateB > openRateA ? "B" : "tie";

    await supabase.from("email_ab_tests").update({
      status: "completed",
      winning_variant: winner,
      completed_at: new Date().toISOString(),
    }).eq("id", test.id);

    toast({ title: `Test completed! Variant ${winner} wins!` });
    fetchTests();
  };

  const deleteTest = async (id: string) => {
    await supabase.from("email_ab_tests").delete().eq("id", id);
    toast({ title: "Test deleted" });
    fetchTests();
  };

  const getOpenRate = (opens: number, sent: number) => {
    if (sent === 0) return 0;
    return (opens / sent) * 100;
  };

  const getClickRate = (clicks: number, sent: number) => {
    if (sent === 0) return 0;
    return (clicks / sent) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FlaskConical className="h-8 w-8 text-primary" />
            A/B Testing
          </h1>
          <p className="text-muted-foreground mt-2">
            Test email subject lines to optimize open rates
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New A/B Test
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New A/B Test</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Test Name</Label>
                <Input
                  value={newTest.test_name}
                  onChange={(e) => setNewTest(prev => ({ ...prev, test_name: e.target.value }))}
                  placeholder="e.g., January Newsletter Subject Test"
                />
              </div>
              <div>
                <Label>Variant A Subject Line</Label>
                <Input
                  value={newTest.variant_a_subject}
                  onChange={(e) => setNewTest(prev => ({ ...prev, variant_a_subject: e.target.value }))}
                  placeholder="e.g., Breaking: New Development Project Announced"
                />
              </div>
              <div>
                <Label>Variant B Subject Line</Label>
                <Input
                  value={newTest.variant_b_subject}
                  onChange={(e) => setNewTest(prev => ({ ...prev, variant_b_subject: e.target.value }))}
                  placeholder="e.g., 🎉 Exciting News: Major Infrastructure Update!"
                />
              </div>
              <Button onClick={handleCreateTest} disabled={creating} className="w-full">
                {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Create Test
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {tests.filter(t => t.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              {tests.filter(t => t.status === "completed").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{tests.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tests List */}
      <div className="space-y-4">
        {tests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FlaskConical className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No A/B tests yet</h3>
              <p className="text-muted-foreground mb-4">Create your first test to start optimizing email subject lines</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Test
              </Button>
            </CardContent>
          </Card>
        ) : (
          tests.map((test) => {
            const openRateA = getOpenRate(test.variant_a_open_count, test.variant_a_sent_count);
            const openRateB = getOpenRate(test.variant_b_open_count, test.variant_b_sent_count);
            const clickRateA = getClickRate(test.variant_a_click_count, test.variant_a_sent_count);
            const clickRateB = getClickRate(test.variant_b_click_count, test.variant_b_sent_count);

            return (
              <Card key={test.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {test.test_name}
                        <Badge variant={test.status === "active" ? "default" : "secondary"}>
                          {test.status}
                        </Badge>
                        {test.winning_variant && (
                          <Badge variant="outline" className="bg-green-500/10 text-green-600">
                            <Trophy className="h-3 w-3 mr-1" />
                            Winner: {test.winning_variant}
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        Created: {new Date(test.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {test.status === "active" && (
                        <Button size="sm" variant="outline" onClick={() => completeTest(test)}>
                          <Square className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                      )}
                      <Button size="sm" variant="destructive" onClick={() => deleteTest(test.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Variant A */}
                    <div className={`p-4 rounded-lg border-2 ${test.winning_variant === "A" ? "border-green-500 bg-green-500/5" : "border-border"}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline">Variant A</Badge>
                        {test.winning_variant === "A" && <Trophy className="h-4 w-4 text-green-500" />}
                      </div>
                      <p className="text-sm font-medium mb-4 line-clamp-2">{test.variant_a_subject}</p>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" /> Open Rate
                            </span>
                            <span>{openRateA.toFixed(1)}%</span>
                          </div>
                          <Progress value={openRateA} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="flex items-center gap-1">
                              <MousePointer className="h-3 w-3" /> Click Rate
                            </span>
                            <span>{clickRateA.toFixed(1)}%</span>
                          </div>
                          <Progress value={clickRateA} className="h-2" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Sent: {test.variant_a_sent_count} | Opens: {test.variant_a_open_count} | Clicks: {test.variant_a_click_count}
                        </p>
                      </div>
                    </div>

                    {/* Variant B */}
                    <div className={`p-4 rounded-lg border-2 ${test.winning_variant === "B" ? "border-green-500 bg-green-500/5" : "border-border"}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline">Variant B</Badge>
                        {test.winning_variant === "B" && <Trophy className="h-4 w-4 text-green-500" />}
                      </div>
                      <p className="text-sm font-medium mb-4 line-clamp-2">{test.variant_b_subject}</p>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" /> Open Rate
                            </span>
                            <span>{openRateB.toFixed(1)}%</span>
                          </div>
                          <Progress value={openRateB} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="flex items-center gap-1">
                              <MousePointer className="h-3 w-3" /> Click Rate
                            </span>
                            <span>{clickRateB.toFixed(1)}%</span>
                          </div>
                          <Progress value={clickRateB} className="h-2" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Sent: {test.variant_b_sent_count} | Opens: {test.variant_b_open_count} | Clicks: {test.variant_b_click_count}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ABTestingDashboard;