'use client';

import React, { useEffect, useState, useRef } from 'react';
import { 
  FileText, CheckCircle2, ShieldAlert, Award, Star, Compass, Coins, 
  Copy, Link as LinkIcon, UserPlus, Mic, MicOff, Send, MessageSquare, Volume2, VolumeX, X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

interface MilestoneRecord {
  id: string;
  creator_id?: string | null;
  contractor_id: string;
  title: string;
  description: string;
  status: string;
  amount_hbar: number;
  invoice_ref: string;
  payment_transaction_id?: string;
  reward_token_mint_tx_id?: string;
  certificate_nft_id?: string;
  hcs_audit_sequence?: string;
  contractor_user_id?: string | null;
  contractor_accepted?: boolean;
  created_at: string;
}

interface ChatMessage {
  sender: 'user' | 'agent';
  text: string;
  timestamp: Date;
  requires_approval?: boolean;
  proposed_tool?: {
    name: string;
    params: any;
  };
}

export default function ProcurementPage() {
  const { accessToken, user } = useAuth();
  const [milestones, setMilestones] = useState<MilestoneRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Form State
  const [contractorId, setContractorId] = useState('0.0.345678');
  const [contractorUserId, setContractorUserId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amountHbar, setAmountHbar] = useState(15.0);
  const [invoiceRef, setInvoiceRef] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [viewTab, setViewTab] = useState<'creator' | 'contractor'>('creator');
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const inviteId = searchParams.get('invite');

  // Chat Panel State
  const [activeChatMilestone, setActiveChatMilestone] = useState<MilestoneRecord | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Speech Recognition API setup
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'en-US';
        
        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputValue(transcript);
          setIsRecording(false);
          toast.success('Voice recognized!');
        };

        rec.onerror = () => {
          setIsRecording(false);
          toast.error('Voice recognition failed. Please try again.');
        };

        rec.onend = () => {
          setIsRecording(false);
        };

        setRecognition(rec);
      }
    }
  }, []);

  const toggleRecording = () => {
    if (!recognition) {
      toast.error('Speech recognition not supported in this browser.');
      return;
    }
    if (isRecording) {
      recognition.stop();
    } else {
      setIsRecording(true);
      recognition.start();
      toast.info('Listening... Speak now.');
    }
  };

  const speakText = (text: string) => {
    if (typeof window === 'undefined') return;
    if (!isSoundOn) {
      window.speechSynthesis.cancel();
      return;
    }
    window.speechSynthesis.cancel(); // stop current audio
    
    // Split the text to remove markdown characters to make speech natural
    const cleanText = text.replace(/[*#`_\-]/g, '').trim();
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Try to find a premium, natural-sounding English voice
    if (window.speechSynthesis.getVoices) {
      const voices = window.speechSynthesis.getVoices();
      const premiumVoice = voices.find(v => 
        (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Microsoft Zira') || v.name.includes('Samantha')) && 
        v.lang.startsWith('en')
      );
      if (premiumVoice) {
        utterance.voice = premiumVoice;
      }
    }
    
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  };


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const fetchMilestones = () => {
    if (!accessToken) return;
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/milestones`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setMilestones(data);
        if (inviteId) {
          const invited = data.find((m: MilestoneRecord) => m.id === inviteId);
          if (invited) {
            setViewTab(invited.creator_id === user?.id ? 'creator' : 'contractor');
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (accessToken) {
      if (inviteId) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/milestones/${inviteId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
          .then((r) => r.ok ? r.json() : null)
          .then((data) => {
            if (data && data.creator_id !== user?.id) {
               setViewTab('contractor');
               setMilestones(prev => {
                  if (!prev.find(m => m.id === data.id)) return [data, ...prev];
                  return prev;
               });
            }
          })
          .catch(() => {});
      }
      fetchMilestones();
    }
  }, [accessToken, inviteId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/milestones`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractor_id: contractorId,
          contractor_user_id: contractorUserId || undefined,
          title,
          description,
          amount_hbar: Number(amountHbar),
          invoice_ref: invoiceRef || `INV-${Math.floor(100000 + Math.random() * 900000)}`,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to create agreement');
      }

      setModalOpen(false);
      setContractorUserId('');
      setTitle('');
      setDescription('');
      setInvoiceRef('');
      fetchMilestones();
      toast.success('Escrow Agreement Initialized Successfully');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Chat conversation execution workflow
  const openSettlementAgentChat = (milestone: MilestoneRecord) => {
    setActiveChatMilestone(milestone);
    setChatMessages([
      {
        sender: 'agent',
        text: `Initiating connection to the secure Enterprise Treasury AI Agent... \n\nConnecting to Hedera Consensus Service topic and verifying Kit availability...`,
        timestamp: new Date()
      }
    ]);
    
    // Auto-fetch initial prompt
    setChatLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/milestones/agent-chat`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        milestone_id: milestone.id,
        message: 'hello'
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        setChatMessages(prev => [
          ...prev,
          {
            sender: 'agent',
            text: data.response,
            timestamp: new Date(),
            requires_approval: data.requires_approval,
            proposed_tool: data.proposed_tool
          }
        ]);
        speakText(data.response);
      })
      .catch(() => {
        toast.error('Failed to wake up backend treasury AI Agent.');
      })
      .finally(() => setChatLoading(false));
  };

  const handleSendChatMessage = async (customMsg?: string, customAction?: string) => {
    if (!accessToken || !activeChatMilestone) return;
    const msgToSend = customMsg || inputValue;
    if (!msgToSend.trim() && !customAction) return;

    if (!customAction) {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'user',
          text: msgToSend,
          timestamp: new Date()
        }
      ]);
      setInputValue('');
    }

    setChatLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/milestones/agent-chat`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          milestone_id: activeChatMilestone.id,
          message: msgToSend,
          action: customAction
        }),
      });

      if (!response.ok) throw new Error('Communication error');
      const data = await response.json();

      setChatMessages(prev => [
        ...prev,
        {
          sender: 'agent',
          text: data.response,
          timestamp: new Date(),
          requires_approval: data.requires_approval,
          proposed_tool: data.proposed_tool
        }
      ]);
      speakText(data.response);

      // If settled, refresh milestones list
      if (data.settled_details) {
        fetchMilestones();
        toast.success('On-ledger treasury settlement transaction completed successfully!');
      }
    } catch {
      toast.error('Failed to communicate with treasury AI Agent.');
    } finally {
      setChatLoading(false);
    }
  };

  const handleAccept = async (milestoneId: string) => {
    if (!accessToken) return;
    setAcceptingId(milestoneId);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/milestones/${milestoneId}/accept`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to accept milestone');
      }

      fetchMilestones();
      toast.success('Milestone accepted successfully!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setAcceptingId(null);
    }
  };

  const handleDeliver = async (milestoneId: string) => {
    if (!accessToken) return;
    setActingId(milestoneId);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/milestones/${milestoneId}/deliver`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to mark milestone as delivered');
      }

      fetchMilestones();
      toast.success('Milestone marked as completed and delivered successfully!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActingId(null);
    }
  };

  const handleCancel = async (milestoneId: string) => {
    if (!accessToken) return;
    setActingId(milestoneId);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/milestones/${milestoneId}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to cancel milestone');
      }

      const data = await response.json();
      fetchMilestones();
      if (data.status === 'DISPUTED') {
        toast.warning('Unilateral cancel locked! Escrow is now DISPUTED and locked for AI mediation.');
      } else {
        toast.success('Milestone cancelled successfully!');
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActingId(null);
    }
  };

  const copyInviteLink = (milestoneId: string) => {
    const url = `${window.location.origin}/intelligence-dashboard/procurement?invite=${milestoneId}`;
    navigator.clipboard.writeText(url);
    toast.success('Invite link copied to clipboard!');
  };

  const displayedMilestones = milestones.filter(m => {
    if (viewTab === 'creator') return m.creator_id === user?.id;
    return m.contractor_user_id === user?.id || (inviteId === m.id && m.creator_id !== user?.id);
  });

  return (
    <div className="flex min-h-screen bg-background relative overflow-hidden">
      {/* Primary Procurement Layout */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${activeChatMilestone ? 'pr-[380px] xl:pr-[450px]' : ''}`}>
        {/* Header */}
        <div className="border-b border-border px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <Coins className="text-primary" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Procurement Escrow</h1>
              <p className="text-sm text-muted-foreground">Automated B2B milestones, loyalty cash-backs, and NFT proof of delivery.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-muted/50 p-1 rounded-lg border border-border flex items-center">
              <button
                onClick={() => setViewTab('creator')}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${
                  viewTab === 'creator' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                My Escrows
              </button>
              <button
                onClick={() => setViewTab('contractor')}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${
                  viewTab === 'contractor' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Assigned to Me
              </button>
            </div>
            
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/95 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              Create Escrow
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 rounded-full border-3 border-primary border-t-transparent animate-spin" />
            </div>
          ) : displayedMilestones.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center glass-card max-w-2xl mx-auto rounded-2xl p-12 border border-border">
              <Coins size={48} className="text-muted-foreground mb-4 opacity-55" />
              <h3 className="text-lg font-bold text-foreground mb-2">No Active Agreements</h3>
              <p className="text-sm text-muted-foreground max-w-md mb-6">
                {viewTab === 'creator' 
                  ? "Create an enterprise milestone contract to securely handle settlements, mint completed deliverables certificates, and register secure HCS audits."
                  : "You don't have any pending or settled agreements assigned to you. When a client shares an invite link, you'll see it here."}
              </p>
              {viewTab === 'creator' && (
                <button
                  onClick={() => setModalOpen(true)}
                  className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/95 rounded-lg"
                >
                  Get Started Now
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-7xl mx-auto">
              {displayedMilestones.map((m) => (
                <div
                  key={m.id}
                  className={`glass-card rounded-2xl p-6 border transition-all duration-300 relative overflow-hidden flex flex-col gap-4 ${
                    m.status === 'SETTLED' ? 'border-success/30 hover:border-success/50' : 'border-border hover:border-primary/40'
                  }`}
                >
                  {/* Status Badge */}
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Ref: {m.invoice_ref}</span>
                      <h2 className="text-base font-bold text-foreground mt-0.5">{m.title}</h2>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        m.status === 'SETTLED'
                          ? 'bg-success/10 text-success border border-success/20'
                          : m.status === 'DELIVERED'
                          ? 'bg-primary/10 text-primary border border-primary/20 animate-pulse'
                          : m.status === 'DISPUTED'
                          ? 'bg-destructive/10 text-destructive border border-destructive/20 font-bold'
                          : m.status === 'CANCELLED'
                          ? 'bg-muted text-muted-foreground border border-border'
                          : 'bg-warning/10 text-warning border border-warning/20'
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-3 flex-1">{m.description}</p>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-4 bg-muted/40 p-4 rounded-xl border border-border/40">
                    <div>
                      <span className="text-xs text-muted-foreground block">Settle Value</span>
                      <span className="text-sm font-bold text-foreground">{m.amount_hbar} HBAR</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Contractor ID</span>
                      <span className="text-sm font-semibold text-foreground truncate block">{m.contractor_id}</span>
                    </div>
                    
                    {viewTab === 'creator' && (
                      <div className="col-span-2 pt-2 mt-2 border-t border-border/40 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {m.contractor_accepted ? (
                            <>
                              <UserPlus size={14} className="text-success" />
                              <span className="text-xs font-semibold text-success">Contractor Accepted</span>
                            </>
                          ) : (
                            <>
                              <UserPlus size={14} className="text-warning" />
                              <span className="text-xs font-semibold text-warning">Waiting for Contractor</span>
                            </>
                          )}
                        </div>
                        <button 
                          onClick={() => copyInviteLink(m.id)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors bg-primary/10 px-2 py-1 rounded"
                        >
                          <LinkIcon size={12} />
                          Copy Invite
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Dual Token & Audit details */}
                  {m.status === 'SETTLED' && (
                    <div className="flex flex-col gap-2.5 pt-2 border-t border-border/40">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 size={14} className="text-success" />
                        <span>Invoice Payment settled on-chain by Treasury AI Agent.</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                        <div className="flex items-center gap-2 bg-success/5 border border-success/15 rounded-lg p-2.5">
                          <Award size={16} className="text-success flex-shrink-0" />
                          <div className="min-w-0">
                            <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Loyalty Reward (HTS)</span>
                            <span className="text-xs font-bold text-foreground truncate block">10 HEP-REWARDS Minted</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 bg-success/5 border border-success/15 rounded-lg p-2.5">
                          <Star size={16} className="text-success flex-shrink-0" />
                          <div className="min-w-0">
                            <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Completion Proof (NFT)</span>
                            <span className="text-xs font-bold text-foreground truncate block">Certificate {m.certificate_nft_id}</span>
                          </div>
                        </div>
                      </div>

                      {m.payment_transaction_id && (
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1 bg-muted/30 p-2 rounded-lg border border-border/40">
                          <span>Ledger Settlement Tx ID:</span>
                          <span className="font-mono font-semibold text-foreground truncate max-w-[200px]">{m.payment_transaction_id}</span>
                        </div>
                      )}

                      {m.hcs_audit_sequence && (
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-0.5 bg-muted/30 p-2 rounded-lg border border-border/40">
                          <span>HCS Audit Receipt Sequence:</span>
                          <span className="font-mono font-semibold text-foreground">#{m.hcs_audit_sequence}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  {m.status !== 'SETTLED' && m.status !== 'CANCELLED' && (
                    <div className="mt-2 flex flex-col gap-2">
                      {viewTab === 'creator' ? (
                        <>
                          <button
                            disabled={!m.contractor_accepted}
                            onClick={() => openSettlementAgentChat(m)}
                            className="w-full py-2.5 px-4 text-sm font-semibold bg-success hover:bg-success/95 text-white rounded-lg flex items-center justify-center gap-2 shadow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <MessageSquare size={16} />
                            <span>
                              {m.status === 'DISPUTED'
                                ? 'AI Mediation Sidebar'
                                : m.contractor_accepted 
                                ? 'Settle & Release Escrow Payment' 
                                : 'Awaiting Contractor Acceptance...'}
                            </span>
                          </button>

                          {m.status !== 'DISPUTED' && (
                            <button
                              disabled={actingId === m.id}
                              onClick={() => handleCancel(m.id)}
                              className={`w-full py-2 px-4 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 border transition-all duration-200 ${
                                m.status === 'DELIVERED'
                                  ? 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20'
                                  : 'bg-muted/40 text-muted-foreground border-border hover:bg-destructive hover:text-white'
                              }`}
                            >
                              <ShieldAlert size={14} />
                              <span>{m.status === 'DELIVERED' ? 'Trigger Dispute Lock (Payee Cancel Request)' : 'Cancel Escrow'}</span>
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          {!m.contractor_accepted && (
                            <button
                              disabled={acceptingId === m.id}
                              onClick={() => handleAccept(m.id)}
                              className="w-full py-2.5 px-4 text-sm font-semibold bg-primary hover:bg-primary/95 text-primary-foreground rounded-lg flex items-center justify-center gap-2 shadow transition-all duration-200 disabled:opacity-50"
                            >
                              {acceptingId === m.id ? (
                                <>
                                  <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                                  <span>Accepting...</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 size={16} />
                                  <span>Accept Milestone</span>
                                </>
                              )}
                            </button>
                          )}

                          {m.contractor_accepted && m.status === 'ACTIVE' && (
                            <button
                              disabled={actingId === m.id}
                              onClick={() => handleDeliver(m.id)}
                              className="w-full py-2.5 px-4 text-sm font-semibold bg-success hover:bg-success/95 text-white rounded-lg flex items-center justify-center gap-2 shadow transition-all duration-200"
                            >
                              <CheckCircle2 size={16} />
                              <span>Mark as Completed & Deliver Work</span>
                            </button>
                          )}

                          {m.status === 'DELIVERED' && (
                            <div className="text-center text-xs font-semibold text-primary py-2 px-3 bg-primary/10 border border-primary/20 rounded-lg animate-pulse">
                               Work Delivered! Awaiting Payee Settlement review.
                            </div>
                          )}

                          {m.status === 'DISPUTED' && (
                            <div className="text-center text-xs font-semibold text-destructive py-2 px-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                              ️ Escrow Disputed! Locked for AI/Multi-Sig Mediation.
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Voice-Enabled interactive AI Treasury Agent Chat Panel */}
      {activeChatMilestone && (
        <div className="fixed top-0 right-0 w-[380px] xl:w-[450px] h-screen bg-card border-l border-border flex flex-col z-40 shadow-2xl animate-in slide-in-from-right duration-300">
          {/* Chat Header */}
          <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-success/15 border border-success/30 flex items-center justify-center relative">
                <Coins size={14} className="text-success" />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-success ring-1 ring-card animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Treasury AI Agent</h3>
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Hedera Kit Settlement Operator</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  const nextSound = !isSoundOn;
                  setIsSoundOn(nextSound);
                  if (!nextSound && typeof window !== 'undefined') {
                    window.speechSynthesis.cancel();
                  }
                }} 
                className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors"
                title={isSoundOn ? "Mute agent voice" : "Unmute agent voice"}
              >
                {isSoundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
              <button 
                onClick={() => setActiveChatMilestone(null)}
                className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'}`}>
                <div className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                    : 'bg-muted/60 border border-border text-foreground rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Proposed tool visualizer */}
                  {msg.proposed_tool && (
                    <div className="mt-3.5 pt-3 border-t border-border/80 flex flex-col gap-2.5">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Proposed On-Chain Action</span>
                      <div className="bg-background/80 border border-border rounded-xl p-3 flex flex-col gap-1.5 font-mono text-[11px] text-foreground">
                        <div className="flex items-center gap-1.5">
                          <span className="text-success">Method:</span>
                          <span className="font-semibold">{msg.proposed_tool.name}</span>
                        </div>
                        <div>
                          <span className="text-success">Params:</span>
                          <div className="pl-2.5 mt-1 text-[10px] text-muted-foreground">
                            <div>Recipient: {msg.proposed_tool.params.recipient_id}</div>
                            <div>Value: {msg.proposed_tool.params.amount_hbar} HBAR</div>
                            <div>Invoice Ref: {msg.proposed_tool.params.invoice_ref}</div>
                            <div>Topic: {msg.proposed_tool.params.hcs_topic_id}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* HITL UI Confirm buttons */}
                  {msg.requires_approval && (
                    <div className="mt-4 flex items-center gap-2">
                      <button
                        onClick={() => handleSendChatMessage('I authorize and approve the escrow release.', 'approve')}
                        className="flex-1 py-2 px-3 text-xs font-bold bg-success hover:bg-success/90 text-white rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <CheckCircle2 size={13} />
                        Approve & Settle
                      </button>
                      <button
                        onClick={() => handleSendChatMessage('Please reject and cancel the release operation.', 'deny')}
                        className="py-2 px-3 text-xs font-bold bg-muted hover:bg-muted-foreground/10 text-muted-foreground border border-border rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 px-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}

            {chatLoading && (
              <div className="self-start bg-muted/40 border border-border/60 rounded-2xl rounded-tl-none p-4 flex items-center gap-2 max-w-[80%]">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-muted-foreground/80 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-muted-foreground/80 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-muted-foreground/80 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs text-muted-foreground">Treasury Agent processing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input / Controls */}
          <div className="p-4 border-t border-border flex flex-col gap-2.5 bg-muted/10">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChatMessage();
              }}
              className="flex items-center gap-2 bg-muted/50 border border-border rounded-xl px-3 py-1.5 focus-within:border-primary/50 transition-colors"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Talk to the settlement assistant..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none py-1"
              />
              
              <button
                type="button"
                onClick={toggleRecording}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isRecording 
                    ? 'bg-destructive/10 text-destructive border border-destructive/20 animate-pulse' 
                    : 'hover:bg-muted text-muted-foreground'
                }`}
                title="Speak voice input"
              >
                {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
              </button>

              <button
                type="submit"
                disabled={!inputValue.trim() || chatLoading}
                className="w-8 h-8 bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:hover:bg-primary text-primary-foreground rounded-lg flex items-center justify-center transition-colors"
              >
                <Send size={14} />
              </button>
            </form>
            <div className="flex items-center gap-1.5 justify-center text-[10px] text-muted-foreground">
              <span> Voice control enabled</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span> Interactive Text-to-Speech active</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="glass-card max-w-lg w-full rounded-2xl border border-border shadow-2xl p-6 relative overflow-hidden animate-in zoom-in-95 duration-200">
            <h2 className="text-lg font-bold text-foreground mb-1">Create Procurement Escrow</h2>
            <p className="text-xs text-muted-foreground mb-6">Initialize a new secure milestone and reward loyalty tokenization agreements.</p>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs p-3 rounded-lg mb-4 flex items-center gap-2">
                <ShieldAlert size={14} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Contractor / Merchant Account ID</label>
                <input
                  id="escrow-contractor-id"
                  type="text"
                  required
                  value={contractorId}
                  onChange={(e) => setContractorId(e.target.value)}
                  className="bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground caret-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Contractor Platform ID (Optional)</label>
                <input
                  id="escrow-contractor-user-id"
                  type="text"
                  placeholder="Platform User UUID (e.g. for immediate assignment)"
                  value={contractorUserId}
                  onChange={(e) => setContractorUserId(e.target.value)}
                  className="bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground caret-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Agreement Title</label>
                <input
                  id="escrow-title"
                  type="text"
                  required
                  placeholder="e.g. Design Wireframes Delivery"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground caret-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Deliverables Description</label>
                <textarea
                  id="escrow-description"
                  required
                  rows={3}
                  placeholder="Detail the technical criteria and expectations..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground caret-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Settle Value (HBAR)</label>
                  <input
                    id="escrow-amount"
                    type="number"
                    step="0.01"
                    required
                    value={amountHbar}
                    onChange={(e) => setAmountHbar(Number(e.target.value))}
                    className="bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground caret-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Invoice Ref (Optional)</label>
                  <input
                    id="escrow-invoice-ref"
                    type="text"
                    placeholder="Auto-generated"
                    value={invoiceRef}
                    onChange={(e) => setInvoiceRef(e.target.value)}
                    className="bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground caret-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold hover:bg-muted text-muted-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/95 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Initializing Agreement...' : 'Initialize Escrow'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
