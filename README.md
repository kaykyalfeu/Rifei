import React, { useState, useEffect } from 'react';
import { Search, Bell, User, Plus, Heart, MessageCircle, Share2, Trophy, Star, Clock, Users, TrendingUp, Filter, Grid, List, Home, Compass, PlusCircle, BarChart3, Settings, ChevronRight, Zap, Gift, Crown, Flame, Check, X, Moon, Sun, Menu, Sparkles, Target, Award, ShoppingBag, Ticket } from 'lucide-react';

// ============================================
// RIFEI - Plataforma de Rifas e Sorteios
// Com Feed Social Comunitário
// ============================================

const RifeiApp = () => {
  const [currentPage, setCurrentPage] = useState('feed');
  const [darkMode, setDarkMode] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedRifa, setSelectedRifa] = useState(null);

  // Dados mockados para demonstração
  const rifas = [
    {
      id: 1,
      titulo: "iPhone 15 Pro Max 256GB",
      criador: { nome: "TechStore", avatar: "🏪", verificado: true, nivel: 5 },
      imagem: "📱",
      preco: 5.00,
      totalNumeros: 100,
      numerosVendidos: 78,
      dataFim: "2026-01-20",
      categoria: "Eletrônicos",
      destaque: true,
      likes: 234,
      comentarios: 45,
      participantes: 78
    },
    {
      id: 2,
      titulo: "PlayStation 5 + 3 Jogos",
      criador: { nome: "GameWorld", avatar: "🎮", verificado: true, nivel: 4 },
      imagem: "🎮",
      preco: 3.00,
      totalNumeros: 200,
      numerosVendidos: 156,
      dataFim: "2026-01-18",
      categoria: "Games",
      destaque: false,
      likes: 189,
      comentarios: 32,
      participantes: 156
    },
    {
      id: 3,
      titulo: "Viagem para Cancún - Casal",
      criador: { nome: "ViagemDream", avatar: "✈️", verificado: true, nivel: 5 },
      imagem: "🏝️",
      preco: 10.00,
      totalNumeros: 500,
      numerosVendidos: 423,
      dataFim: "2026-01-25",
      categoria: "Viagens",
      destaque: true,
      likes: 567,
      comentarios: 89,
      participantes: 423
    },
    {
      id: 4,
      titulo: "MacBook Air M3",
      criador: { nome: "AppleBR", avatar: "🍎", verificado: false, nivel: 3 },
      imagem: "💻",
      preco: 8.00,
      totalNumeros: 150,
      numerosVendidos: 89,
      dataFim: "2026-01-22",
      categoria: "Eletrônicos",
      destaque: false,
      likes: 145,
      comentarios: 23,
      participantes: 89
    },
    {
      id: 5,
      titulo: "Moto Honda CB 500F 0km",
      criador: { nome: "MotoShop", avatar: "🏍️", verificado: true, nivel: 5 },
      imagem: "🏍️",
      preco: 15.00,
      totalNumeros: 1000,
      numerosVendidos: 734,
      dataFim: "2026-02-01",
      categoria: "Veículos",
      destaque: true,
      likes: 892,
      comentarios: 156,
      participantes: 734
    }
  ];

  const feedPosts = [
    {
      id: 1,
      tipo: "ganhador",
      usuario: { nome: "Maria Silva", avatar: "👩", nivel: 3 },
      rifa: "iPhone 14 Pro",
      criador: "TechStore",
      tempo: "2 horas atrás",
      likes: 234,
      comentarios: 45,
      conteudo: "NÃO ACREDITO! 😭🎉 Ganhei meu primeiro sorteio! Obrigada @TechStore pela transparência!"
    },
    {
      id: 2,
      tipo: "nova_rifa",
      usuario: { nome: "GameWorld", avatar: "🎮", nivel: 4, verificado: true },
      tempo: "4 horas atrás",
      likes: 156,
      comentarios: 28,
      rifa: rifas[1],
      conteudo: "🚀 NOVA RIFA! PlayStation 5 + 3 jogos! Apenas R$3 o número!"
    },
    {
      id: 3,
      tipo: "conquista",
      usuario: { nome: "Pedro Santos", avatar: "👨", nivel: 4 },
      tempo: "6 horas atrás",
      likes: 89,
      comentarios: 12,
      conquista: "Sortudo Iniciante",
      conteudo: "Desbloqueei a conquista 'Sortudo Iniciante' após ganhar 3 rifas! 🏆"
    },
    {
      id: 4,
      tipo: "comentario",
      usuario: { nome: "Ana Costa", avatar: "👩‍🦰", nivel: 2 },
      tempo: "8 horas atrás",
      likes: 45,
      comentarios: 8,
      rifaRef: "Viagem para Cancún",
      conteudo: "Alguém mais participando dessa? Tô com 10 números! 🤞"
    }
  ];

  const categorias = [
    { nome: "Todos", icone: "🎯", count: 156 },
    { nome: "Eletrônicos", icone: "📱", count: 45 },
    { nome: "Veículos", icone: "🚗", count: 23 },
    { nome: "Viagens", icone: "✈️", count: 18 },
    { nome: "Games", icone: "🎮", count: 34 },
    { nome: "Casa", icone: "🏠", count: 28 },
    { nome: "Moda", icone: "👗", count: 15 }
  ];

  const conquistas = [
    { nome: "Primeiro Passo", icone: "🎯", descricao: "Participou da primeira rifa", conquistada: true },
    { nome: "Sortudo", icone: "🍀", descricao: "Ganhou uma rifa", conquistada: true },
    { nome: "Colecionador", icone: "🏆", descricao: "Participou de 10 rifas", conquistada: false },
    { nome: "Social", icone: "💬", descricao: "Fez 50 comentários", conquistada: false }
  ];

  // Cores do tema
  const theme = {
    light: {
      bg: 'bg-gradient-to-br from-emerald-50 via-white to-violet-50',
      card: 'bg-white/80 backdrop-blur-xl',
      cardHover: 'hover:bg-white',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600',
      border: 'border-gray-200/50',
      accent: 'from-emerald-400 to-violet-500',
      accentSolid: 'bg-emerald-500',
      accentLight: 'bg-emerald-50',
      sidebar: 'bg-white/70 backdrop-blur-2xl',
      input: 'bg-white/90'
    },
    dark: {
      bg: 'bg-gradient-to-br from-gray-950 via-gray-900 to-violet-950',
      card: 'bg-gray-800/80 backdrop-blur-xl',
      cardHover: 'hover:bg-gray-800',
      text: 'text-white',
      textSecondary: 'text-gray-400',
      border: 'border-gray-700/50',
      accent: 'from-emerald-400 to-violet-400',
      accentSolid: 'bg-emerald-500',
      accentLight: 'bg-emerald-900/30',
      sidebar: 'bg-gray-900/90 backdrop-blur-2xl',
      input: 'bg-gray-800/90'
    }
  };

  const t = darkMode ? theme.dark : theme.light;

  // Componente Header
  const Header = () => (
    <header className={`fixed top-0 left-0 right-0 z-50 ${t.sidebar} border-b ${t.border}`}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <button 
            className="lg:hidden p-2 rounded-xl hover:bg-emerald-500/10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-violet-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <span className={`text-2xl font-black tracking-tight ${t.text}`}>
              rif<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-violet-500">ei</span>
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-xl mx-8">
          <div className={`relative w-full`}>
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${t.textSecondary}`} />
            <input
              type="text"
              placeholder="Buscar rifas, criadores, categorias..."
              className={`w-full pl-12 pr-4 py-3 rounded-2xl ${t.input} border ${t.border} ${t.text} placeholder:${t.textSecondary} focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all`}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-3 rounded-xl ${t.card} border ${t.border} ${t.cardHover} transition-all`}
          >
            {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-violet-500" />}
          </button>
          
          <button className={`p-3 rounded-xl ${t.card} border ${t.border} ${t.cardHover} transition-all relative`}>
            <Bell className={`w-5 h-5 ${t.text}`} />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold">3</span>
          </button>

          <button 
            onClick={() => setShowCreateModal(true)}
            className="hidden sm:flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-violet-500 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>Criar Rifa</span>
          </button>

          <div className={`w-11 h-11 rounded-xl ${t.card} border ${t.border} flex items-center justify-center cursor-pointer hover:scale-105 transition-all`}>
            <span className="text-2xl">👤</span>
          </div>
        </div>
      </div>
    </header>
  );

  // Sidebar
  const Sidebar = () => (
    <aside className={`fixed left-0 top-16 bottom-0 w-64 ${t.sidebar} border-r ${t.border} p-4 hidden lg:block overflow-y-auto`}>
      <nav className="space-y-2">
        {[
          { id: 'feed', icon: Home, label: 'Feed', badge: null },
          { id: 'marketplace', icon: Compass, label: 'Explorar', badge: 'Novo' },
          { id: 'criar', icon: PlusCircle, label: 'Criar Rifa', badge: null },
          { id: 'dashboard', icon: BarChart3, label: 'Dashboard', badge: null },
          { id: 'perfil', icon: User, label: 'Meu Perfil', badge: null },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              currentPage === item.id
                ? 'bg-gradient-to-r from-emerald-500 to-violet-500 text-white shadow-lg shadow-emerald-500/25'
                : `${t.text} hover:bg-emerald-500/10`
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
            {item.badge && (
              <span className="ml-auto px-2 py-0.5 text-xs font-bold bg-violet-500 text-white rounded-full">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Categorias */}
      <div className="mt-8">
        <h3 className={`text-sm font-semibold ${t.textSecondary} uppercase tracking-wider mb-3 px-4`}>
          Categorias
        </h3>
        <div className="space-y-1">
          {categorias.slice(0, 5).map((cat) => (
            <button
              key={cat.nome}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl ${t.text} hover:bg-emerald-500/10 transition-all`}
            >
              <span className="text-lg">{cat.icone}</span>
              <span className="font-medium">{cat.nome}</span>
              <span className={`ml-auto text-sm ${t.textSecondary}`}>{cat.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Conquistas Preview */}
      <div className={`mt-8 p-4 rounded-2xl ${t.card} border ${t.border}`}>
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <span className={`font-semibold ${t.text}`}>Suas Conquistas</span>
        </div>
        <div className="flex gap-2">
          {conquistas.filter(c => c.conquistada).map((c, i) => (
            <div key={i} className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-lg shadow-lg">
              {c.icone}
            </div>
          ))}
          <div className={`w-10 h-10 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center`}>
            <span className={t.textSecondary}>+2</span>
          </div>
        </div>
      </div>
    </aside>
  );

  // Mobile Menu
  const MobileMenu = () => (
    <div className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
      <aside className={`absolute left-0 top-0 bottom-0 w-72 ${t.sidebar} p-4 pt-20 transform transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <nav className="space-y-2">
          {[
            { id: 'feed', icon: Home, label: 'Feed' },
            { id: 'marketplace', icon: Compass, label: 'Explorar' },
            { id: 'criar', icon: PlusCircle, label: 'Criar Rifa' },
            { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
            { id: 'perfil', icon: User, label: 'Meu Perfil' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { setCurrentPage(item.id); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                currentPage === item.id
                  ? 'bg-gradient-to-r from-emerald-500 to-violet-500 text-white'
                  : `${t.text} hover:bg-emerald-500/10`
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>
    </div>
  );

  // Card de Rifa
  const RifaCard = ({ rifa, compact = false }) => {
    const progresso = (rifa.numerosVendidos / rifa.totalNumeros) * 100;
    const diasRestantes = Math.ceil((new Date(rifa.dataFim) - new Date()) / (1000 * 60 * 60 * 24));

    return (
      <div 
        className={`${t.card} rounded-3xl border ${t.border} overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 hover:scale-[1.02] hover:-translate-y-1`}
        onClick={() => setSelectedRifa(rifa)}
      >
        {/* Imagem */}
        <div className="relative h-48 bg-gradient-to-br from-emerald-400/20 to-violet-400/20 flex items-center justify-center overflow-hidden">
          <span className="text-7xl transform group-hover:scale-110 transition-transform duration-500">{rifa.imagem}</span>
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {rifa.destaque && (
              <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-lg">
                <Flame className="w-3 h-3" /> Destaque
              </span>
            )}
            <span className={`px-3 py-1 ${darkMode ? 'bg-gray-800/90' : 'bg-white/90'} ${t.text} text-xs font-medium rounded-full backdrop-blur-sm`}>
              {rifa.categoria}
            </span>
          </div>

          {/* Timer */}
          <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-full flex items-center gap-1.5 text-white text-sm">
            <Clock className="w-4 h-4" />
            <span className="font-medium">{diasRestantes}d restantes</span>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-5">
          {/* Criador */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-violet-500 flex items-center justify-center text-sm">
              {rifa.criador.avatar}
            </div>
            <span className={`font-medium ${t.text}`}>{rifa.criador.nome}</span>
            {rifa.criador.verificado && (
              <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
            <div className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-500/10 to-violet-500/10">
              <Star className="w-3 h-3 text-yellow-500" />
              <span className={`text-xs font-medium ${t.text}`}>Nv.{rifa.criador.nivel}</span>
            </div>
          </div>

          {/* Título */}
          <h3 className={`font-bold text-lg ${t.text} mb-3 line-clamp-2`}>{rifa.titulo}</h3>

          {/* Progresso */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className={t.textSecondary}>{rifa.numerosVendidos}/{rifa.totalNumeros} números</span>
              <span className="font-bold text-emerald-500">{progresso.toFixed(0)}%</span>
            </div>
            <div className={`h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
              <div 
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-violet-500 transition-all duration-500"
                style={{ width: `${progresso}%` }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div>
              <span className={`text-sm ${t.textSecondary}`}>A partir de</span>
              <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-violet-500">
                R$ {rifa.preco.toFixed(2)}
              </p>
            </div>
            <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-violet-500 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all hover:scale-105">
              Participar
            </button>
          </div>

          {/* Social Stats */}
          <div className={`flex items-center gap-4 mt-4 pt-4 border-t ${t.border}`}>
            <button className={`flex items-center gap-1.5 ${t.textSecondary} hover:text-red-500 transition-colors`}>
              <Heart className="w-4 h-4" />
              <span className="text-sm">{rifa.likes}</span>
            </button>
            <button className={`flex items-center gap-1.5 ${t.textSecondary} hover:text-emerald-500 transition-colors`}>
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{rifa.comentarios}</span>
            </button>
            <button className={`flex items-center gap-1.5 ${t.textSecondary} hover:text-violet-500 transition-colors`}>
              <Users className="w-4 h-4" />
              <span className="text-sm">{rifa.participantes}</span>
            </button>
            <button className={`ml-auto ${t.textSecondary} hover:text-emerald-500 transition-colors`}>
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Post do Feed
  const FeedPost = ({ post }) => (
    <div className={`${t.card} rounded-3xl border ${t.border} p-5 transition-all hover:shadow-lg`}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-violet-500 flex items-center justify-center text-2xl shadow-lg">
          {post.usuario.avatar}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`font-bold ${t.text}`}>{post.usuario.nome}</span>
            {post.usuario.verificado && (
              <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-500/10 to-violet-500/10 ${t.text}`}>
              Nv.{post.usuario.nivel}
            </span>
          </div>
          <span className={`text-sm ${t.textSecondary}`}>{post.tempo}</span>
        </div>
        
        {/* Tipo de Post Badge */}
        {post.tipo === 'ganhador' && (
          <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold flex items-center gap-1">
            <Trophy className="w-3 h-3" /> Ganhador!
          </div>
        )}
        {post.tipo === 'conquista' && (
          <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-400 to-purple-500 text-white text-xs font-bold flex items-center gap-1">
            <Award className="w-3 h-3" /> Conquista
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <p className={`${t.text} text-lg mb-4 leading-relaxed`}>{post.conteudo}</p>

      {/* Rifa Preview se for nova rifa */}
      {post.tipo === 'nova_rifa' && post.rifa && (
        <div className={`p-4 rounded-2xl ${darkMode ? 'bg-gray-900/50' : 'bg-gray-50'} mb-4`}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-400/20 to-violet-400/20 flex items-center justify-center text-3xl">
              {post.rifa.imagem}
            </div>
            <div className="flex-1">
              <h4 className={`font-bold ${t.text}`}>{post.rifa.titulo}</h4>
              <p className="text-emerald-500 font-bold">R$ {post.rifa.preco.toFixed(2)} /número</p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-violet-500 text-white font-semibold text-sm">
              Ver Rifa
            </button>
          </div>
        </div>
      )}

      {/* Conquista Preview */}
      {post.tipo === 'conquista' && (
        <div className={`p-4 rounded-2xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 mb-4 flex items-center gap-4`}>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-2xl shadow-lg">
            🏆
          </div>
          <div>
            <h4 className={`font-bold ${t.text}`}>{post.conquista}</h4>
            <p className={t.textSecondary}>Conquista desbloqueada!</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className={`flex items-center gap-6 pt-4 border-t ${t.border}`}>
        <button className={`flex items-center gap-2 ${t.textSecondary} hover:text-red-500 transition-colors group`}>
          <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="font-medium">{post.likes}</span>
        </button>
        <button className={`flex items-center gap-2 ${t.textSecondary} hover:text-emerald-500 transition-colors group`}>
          <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="font-medium">{post.comentarios}</span>
        </button>
        <button className={`flex items-center gap-2 ${t.textSecondary} hover:text-violet-500 transition-colors group ml-auto`}>
          <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="font-medium">Compartilhar</span>
        </button>
      </div>
    </div>
  );

  // Página Feed
  const FeedPage = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Feed Principal */}
      <div className="lg:col-span-2 space-y-6">
        {/* Stories / Rifas em Alta */}
        <div className={`${t.card} rounded-3xl border ${t.border} p-5`}>
          <h3 className={`font-bold ${t.text} mb-4 flex items-center gap-2`}>
            <Flame className="w-5 h-5 text-orange-500" />
            Rifas em Alta
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
            {rifas.filter(r => r.destaque).map((rifa) => (
              <div 
                key={rifa.id}
                className="flex-shrink-0 w-24 cursor-pointer group"
                onClick={() => setSelectedRifa(rifa)}
              >
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-400 to-violet-500 p-0.5 group-hover:scale-105 transition-transform">
                  <div className={`w-full h-full rounded-2xl ${darkMode ? 'bg-gray-900' : 'bg-white'} flex items-center justify-center text-4xl`}>
                    {rifa.imagem}
                  </div>
                </div>
                <p className={`text-xs ${t.text} text-center mt-2 font-medium truncate`}>{rifa.criador.nome}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Criar Post */}
        <div className={`${t.card} rounded-3xl border ${t.border} p-5`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-violet-500 flex items-center justify-center text-2xl">
              👤
            </div>
            <input
              type="text"
              placeholder="Compartilhe sua sorte ou dê uma dica..."
              className={`flex-1 px-4 py-3 rounded-xl ${t.input} border ${t.border} ${t.text} placeholder:${t.textSecondary} focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
            />
            <button className="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-violet-500 text-white">
              <Sparkles className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Posts */}
        {feedPosts.map((post) => (
          <FeedPost key={post.id} post={post} />
        ))}
      </div>

      {/* Sidebar Direita */}
      <div className="space-y-6">
        {/* Suas Participações */}
        <div className={`${t.card} rounded-3xl border ${t.border} p-5`}>
          <h3 className={`font-bold ${t.text} mb-4 flex items-center gap-2`}>
            <Ticket className="w-5 h-5 text-emerald-500" />
            Suas Participações
          </h3>
          <div className="space-y-3">
            {rifas.slice(0, 3).map((rifa) => (
              <div key={rifa.id} className={`flex items-center gap-3 p-3 rounded-xl ${darkMode ? 'bg-gray-900/50' : 'bg-gray-50'} cursor-pointer hover:bg-emerald-500/10 transition-colors`}>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400/20 to-violet-400/20 flex items-center justify-center text-2xl">
                  {rifa.imagem}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${t.text} truncate`}>{rifa.titulo}</p>
                  <p className={`text-sm ${t.textSecondary}`}>5 números</p>
                </div>
                <ChevronRight className={`w-5 h-5 ${t.textSecondary}`} />
              </div>
            ))}
          </div>
          <button className={`w-full mt-4 py-2.5 rounded-xl border ${t.border} ${t.text} font-medium hover:bg-emerald-500/10 transition-colors`}>
            Ver todas
          </button>
        </div>

        {/* Ranking */}
        <div className={`${t.card} rounded-3xl border ${t.border} p-5`}>
          <h3 className={`font-bold ${t.text} mb-4 flex items-center gap-2`}>
            <Crown className="w-5 h-5 text-yellow-500" />
            Top Sortudos da Semana
          </h3>
          <div className="space-y-3">
            {[
              { pos: 1, nome: "Maria S.", avatar: "👩", vitorias: 3, cor: "from-yellow-400 to-amber-500" },
              { pos: 2, nome: "João P.", avatar: "👨", vitorias: 2, cor: "from-gray-300 to-gray-400" },
              { pos: 3, nome: "Ana C.", avatar: "👩‍🦰", vitorias: 2, cor: "from-amber-600 to-amber-700" },
            ].map((user) => (
              <div key={user.pos} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${user.cor} flex items-center justify-center text-white font-bold text-sm`}>
                  {user.pos}
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400/20 to-violet-400/20 flex items-center justify-center text-xl">
                  {user.avatar}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${t.text}`}>{user.nome}</p>
                  <p className={`text-sm ${t.textSecondary}`}>{user.vitorias} vitórias</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sorte Acumulada */}
        <div className={`rounded-3xl bg-gradient-to-br from-emerald-500 to-violet-600 p-5 text-white`}>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5" />
            <span className="font-bold">Sua Sorte Acumulada</span>
          </div>
          <div className="text-4xl font-black mb-2">+15%</div>
          <p className="text-sm text-white/80">Participe de mais rifas para aumentar!</p>
          <div className="mt-4 h-2 rounded-full bg-white/20">
            <div className="h-full w-3/5 rounded-full bg-white" />
          </div>
        </div>
      </div>
    </div>
  );

  // Página Marketplace
  const MarketplacePage = () => {
    const [viewMode, setViewMode] = useState('grid');
    const [selectedCategory, setSelectedCategory] = useState('Todos');

    return (
      <div className="space-y-6">
        {/* Hero */}
        <div className={`rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-violet-600 p-8 text-white relative overflow-hidden`}>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.1\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
          <div className="relative">
            <h1 className="text-3xl md:text-4xl font-black mb-2">Explore Rifas Incríveis 🎯</h1>
            <p className="text-lg text-white/80 mb-6">Encontre a oportunidade perfeita para você</p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Gift className="w-5 h-5" />
                <span className="font-medium">{rifas.length} rifas ativas</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Users className="w-5 h-5" />
                <span className="font-medium">12.5k participantes</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Trophy className="w-5 h-5" />
                <span className="font-medium">156 ganhadores hoje</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className={`${t.card} rounded-3xl border ${t.border} p-5`}>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Categorias */}
            <div className="flex-1 flex gap-2 overflow-x-auto pb-2">
              {categorias.map((cat) => (
                <button
                  key={cat.nome}
                  onClick={() => setSelectedCategory(cat.nome)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl font-medium transition-all ${
                    selectedCategory === cat.nome
                      ? 'bg-gradient-to-r from-emerald-500 to-violet-500 text-white shadow-lg'
                      : `${t.card} border ${t.border} ${t.text} hover:bg-emerald-500/10`
                  }`}
                >
                  <span className="mr-2">{cat.icone}</span>
                  {cat.nome}
                </button>
              ))}
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-emerald-500 text-white' : `${t.card} border ${t.border} ${t.text}`}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-emerald-500 text-white' : `${t.card} border ${t.border} ${t.text}`}`}
              >
                <List className="w-5 h-5" />
              </button>
              <button className={`p-2.5 rounded-xl ${t.card} border ${t.border} ${t.text}`}>
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Grid de Rifas */}
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
          {rifas.map((rifa) => (
            <RifaCard key={rifa.id} rifa={rifa} compact={viewMode === 'list'} />
          ))}
        </div>
      </div>
    );
  };

  // Página Criar Rifa
  const CriarRifaPage = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
      titulo: '',
      descricao: '',
      categoria: '',
      totalNumeros: 100,
      precoNumero: 5,
      dataFim: ''
    });

    return (
      <div className="max-w-3xl mx-auto">
        <div className={`${t.card} rounded-3xl border ${t.border} overflow-hidden`}>
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-emerald-500 to-violet-600 text-white">
            <h1 className="text-2xl font-black mb-2">Criar Nova Rifa 🎉</h1>
            <p className="text-white/80">Configure sua rifa e comece a vender!</p>
          </div>

          {/* Progress */}
          <div className="p-6 border-b border-gray-200/50">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step >= s 
                      ? 'bg-gradient-to-r from-emerald-500 to-violet-500 text-white' 
                      : `${darkMode ? 'bg-gray-700' : 'bg-gray-200'} ${t.textSecondary}`
                  }`}>
                    {s}
                  </div>
                  {s < 3 && (
                    <div className={`w-24 h-1 mx-2 rounded-full ${step > s ? 'bg-emerald-500' : darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm">
              <span className={step >= 1 ? t.text : t.textSecondary}>Informações</span>
              <span className={step >= 2 ? t.text : t.textSecondary}>Configurações</span>
              <span className={step >= 3 ? t.text : t.textSecondary}>Revisão</span>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 space-y-6">
            {step === 1 && (
              <>
                <div>
                  <label className={`block font-medium ${t.text} mb-2`}>Título da Rifa *</label>
                  <input
                    type="text"
                    value={formData.titulo}
                    onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                    placeholder="Ex: iPhone 15 Pro Max 256GB"
                    className={`w-full px-4 py-3 rounded-xl ${t.input} border ${t.border} ${t.text} focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
                  />
                </div>

                <div>
                  <label className={`block font-medium ${t.text} mb-2`}>Descrição *</label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    placeholder="Descreva o prêmio em detalhes..."
                    rows={4}
                    className={`w-full px-4 py-3 rounded-xl ${t.input} border ${t.border} ${t.text} focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none`}
                  />
                </div>

                <div>
                  <label className={`block font-medium ${t.text} mb-2`}>Categoria *</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {categorias.slice(1).map((cat) => (
                      <button
                        key={cat.nome}
                        onClick={() => setFormData({...formData, categoria: cat.nome})}
                        className={`p-4 rounded-xl border transition-all ${
                          formData.categoria === cat.nome
                            ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/50'
                            : `${t.border} hover:bg-emerald-500/5`
                        }`}
                      >
                        <span className="text-2xl">{cat.icone}</span>
                        <p className={`mt-2 font-medium ${t.text}`}>{cat.nome}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`block font-medium ${t.text} mb-2`}>Imagens do Prêmio</label>
                  <div className={`border-2 border-dashed ${t.border} rounded-xl p-8 text-center cursor-pointer hover:bg-emerald-500/5 transition-colors`}>
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-violet-400/20 flex items-center justify-center">
                      <Plus className={`w-8 h-8 ${t.textSecondary}`} />
                    </div>
                    <p className={`font-medium ${t.text}`}>Clique para adicionar imagens</p>
                    <p className={`text-sm ${t.textSecondary} mt-1`}>PNG, JPG até 5MB</p>
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className={`block font-medium ${t.text} mb-2`}>Total de Números *</label>
                    <input
                      type="number"
                      value={formData.totalNumeros}
                      onChange={(e) => setFormData({...formData, totalNumeros: parseInt(e.target.value)})}
                      min={10}
                      max={10000}
                      className={`w-full px-4 py-3 rounded-xl ${t.input} border ${t.border} ${t.text} focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
                    />
                    <p className={`text-sm ${t.textSecondary} mt-1`}>Mínimo 10, máximo 10.000</p>
                  </div>

                  <div>
                    <label className={`block font-medium ${t.text} mb-2`}>Preço por Número *</label>
                    <div className="relative">
                      <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${t.textSecondary}`}>R$</span>
                      <input
                        type="number"
                        value={formData.precoNumero}
                        onChange={(e) => setFormData({...formData, precoNumero: parseFloat(e.target.value)})}
                        min={1}
                        step={0.5}
                        className={`w-full pl-12 pr-4 py-3 rounded-xl ${t.input} border ${t.border} ${t.text} focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
                      />
                    </div>
                    <p className={`text-sm ${t.textSecondary} mt-1`}>Mínimo R$ 1,00</p>
                  </div>
                </div>

                <div>
                  <label className={`block font-medium ${t.text} mb-2`}>Data de Encerramento *</label>
                  <input
                    type="date"
                    value={formData.dataFim}
                    onChange={(e) => setFormData({...formData, dataFim: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-3 rounded-xl ${t.input} border ${t.border} ${t.text} focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
                  />
                </div>

                {/* Resumo Financeiro */}
                <div className={`p-5 rounded-2xl ${darkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                  <h3 className={`font-bold ${t.text} mb-4`}>Resumo Financeiro</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className={t.textSecondary}>Arrecadação potencial</span>
                      <span className={`font-bold ${t.text}`}>
                        R$ {(formData.totalNumeros * formData.precoNumero).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={t.textSecondary}>Taxa da plataforma (5%)</span>
                      <span className={`font-bold text-red-500`}>
                        - R$ {(formData.totalNumeros * formData.precoNumero * 0.05).toFixed(2)}
                      </span>
                    </div>
                    <hr className={t.border} />
                    <div className="flex justify-between">
                      <span className={`font-bold ${t.text}`}>Você recebe</span>
                      <span className="font-bold text-emerald-500 text-xl">
                        R$ {(formData.totalNumeros * formData.precoNumero * 0.95).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className={`p-5 rounded-2xl ${darkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                  <h3 className={`font-bold ${t.text} mb-4`}>Revisão da Rifa</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <span className={`text-sm ${t.textSecondary}`}>Título</span>
                      <p className={`font-medium ${t.text}`}>{formData.titulo || 'Não informado'}</p>
                    </div>
                    <div>
                      <span className={`text-sm ${t.textSecondary}`}>Categoria</span>
                      <p className={`font-medium ${t.text}`}>{formData.categoria || 'Não selecionada'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className={`text-sm ${t.textSecondary}`}>Total de Números</span>
                        <p className={`font-medium ${t.text}`}>{formData.totalNumeros}</p>
                      </div>
                      <div>
                        <span className={`text-sm ${t.textSecondary}`}>Preço por Número</span>
                        <p className={`font-medium ${t.text}`}>R$ {formData.precoNumero.toFixed(2)}</p>
                      </div>
                    </div>
                    <div>
                      <span className={`text-sm ${t.textSecondary}`}>Data de Encerramento</span>
                      <p className={`font-medium ${t.text}`}>{formData.dataFim || 'Não definida'}</p>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30`}>
                  <p className="text-yellow-600 dark:text-yellow-400 text-sm">
                    <strong>Atenção:</strong> Após publicar, você não poderá alterar o preço ou o número total de cotas.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200/50 flex justify-between">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className={`px-6 py-3 rounded-xl border ${t.border} ${t.text} font-medium hover:bg-emerald-500/10 transition-colors`}
              >
                Voltar
              </button>
            )}
            <button
              onClick={() => step < 3 ? setStep(step + 1) : null}
              className="ml-auto px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-violet-500 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all hover:scale-105"
            >
              {step === 3 ? 'Publicar Rifa' : 'Continuar'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Página Dashboard
  const DashboardPage = () => {
    const stats = [
      { label: 'Rifas Ativas', value: '3', icon: Ticket, cor: 'from-emerald-400 to-emerald-600' },
      { label: 'Total Vendido', value: 'R$ 2.450', icon: TrendingUp, cor: 'from-violet-400 to-violet-600' },
      { label: 'Participantes', value: '156', icon: Users, cor: 'from-blue-400 to-blue-600' },
      { label: 'Ganhadores', value: '8', icon: Trophy, cor: 'from-yellow-400 to-orange-500' },
    ];

    return (
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className={`${t.card} rounded-3xl border ${t.border} p-6 relative overflow-hidden group hover:scale-105 transition-all`}>
              <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full bg-gradient-to-br ${stat.cor} opacity-10 group-hover:opacity-20 transition-opacity`} />
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.cor} flex items-center justify-center mb-4 shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <p className={`text-sm ${t.textSecondary} mb-1`}>{stat.label}</p>
              <p className={`text-3xl font-black ${t.text}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Minhas Rifas */}
          <div className={`${t.card} rounded-3xl border ${t.border} p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`font-bold text-lg ${t.text}`}>Minhas Rifas</h3>
              <button className="text-emerald-500 font-medium text-sm hover:underline">Ver todas</button>
            </div>
            <div className="space-y-4">
              {rifas.slice(0, 3).map((rifa) => {
                const progresso = (rifa.numerosVendidos / rifa.totalNumeros) * 100;
                return (
                  <div key={rifa.id} className={`p-4 rounded-2xl ${darkMode ? 'bg-gray-900/50' : 'bg-gray-50'} hover:bg-emerald-500/5 transition-colors cursor-pointer`}>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400/20 to-violet-400/20 flex items-center justify-center text-2xl">
                        {rifa.imagem}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-bold ${t.text} truncate`}>{rifa.titulo}</h4>
                        <p className={`text-sm ${t.textSecondary}`}>
                          {rifa.numerosVendidos}/{rifa.totalNumeros} vendidos
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-500 font-bold">R$ {(rifa.numerosVendidos * rifa.preco).toFixed(2)}</p>
                        <p className={`text-sm ${t.textSecondary}`}>arrecadado</p>
                      </div>
                    </div>
                    <div className={`h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-violet-500"
                        style={{ width: `${progresso}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Atividade Recente */}
          <div className={`${t.card} rounded-3xl border ${t.border} p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`font-bold text-lg ${t.text}`}>Atividade Recente</h3>
              <button className="text-emerald-500 font-medium text-sm hover:underline">Ver todas</button>
            </div>
            <div className="space-y-4">
              {[
                { tipo: 'compra', usuario: 'Maria S.', numeros: 5, rifa: 'iPhone 15', tempo: '2 min' },
                { tipo: 'compra', usuario: 'João P.', numeros: 3, rifa: 'PS5', tempo: '15 min' },
                { tipo: 'comentario', usuario: 'Ana C.', rifa: 'Viagem Cancún', tempo: '1h' },
                { tipo: 'compra', usuario: 'Pedro M.', numeros: 10, rifa: 'MacBook', tempo: '2h' },
              ].map((ativ, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    ativ.tipo === 'compra' 
                      ? 'bg-emerald-500/10 text-emerald-500' 
                      : 'bg-violet-500/10 text-violet-500'
                  }`}>
                    {ativ.tipo === 'compra' ? <ShoppingBag className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${t.text}`}>
                      <span className="font-bold">{ativ.usuario}</span>
                      {ativ.tipo === 'compra' 
                        ? ` comprou ${ativ.numeros} números` 
                        : ' comentou'
                      }
                    </p>
                    <p className={`text-sm ${t.textSecondary}`}>{ativ.rifa}</p>
                  </div>
                  <span className={`text-sm ${t.textSecondary}`}>{ativ.tempo}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gráfico de Performance */}
        <div className={`${t.card} rounded-3xl border ${t.border} p-6`}>
          <h3 className={`font-bold text-lg ${t.text} mb-6`}>Performance da Semana</h3>
          <div className="h-64 flex items-end justify-between gap-4">
            {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((dia, i) => {
              const altura = [45, 65, 40, 80, 60, 90, 70][i];
              return (
                <div key={dia} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full rounded-t-xl bg-gradient-to-t from-emerald-500 to-violet-500 transition-all hover:opacity-80"
                    style={{ height: `${altura}%` }}
                  />
                  <span className={`text-sm ${t.textSecondary}`}>{dia}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Página Perfil
  const PerfilPage = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header do Perfil */}
      <div className={`${t.card} rounded-3xl border ${t.border} overflow-hidden`}>
        <div className="h-32 bg-gradient-to-r from-emerald-500 via-teal-500 to-violet-600" />
        <div className="p-6 -mt-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-emerald-400 to-violet-500 border-4 border-white dark:border-gray-800 flex items-center justify-center text-6xl shadow-xl">
              👤
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className={`text-2xl font-black ${t.text}`}>Seu Nome</h1>
                <div className="px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-violet-500 text-white text-xs font-bold">
                  Nível 4
                </div>
              </div>
              <p className={t.textSecondary}>@seunome • Membro desde Jan 2025</p>
            </div>
            <button className={`px-5 py-2.5 rounded-xl border ${t.border} ${t.text} font-medium hover:bg-emerald-500/10 transition-colors`}>
              Editar Perfil
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Rifas Participadas', value: '24' },
          { label: 'Rifas Ganhas', value: '3' },
          { label: 'Rifas Criadas', value: '5' },
          { label: 'Seguidores', value: '156' },
        ].map((stat, i) => (
          <div key={i} className={`${t.card} rounded-2xl border ${t.border} p-4 text-center`}>
            <p className={`text-2xl font-black ${t.text}`}>{stat.value}</p>
            <p className={`text-sm ${t.textSecondary}`}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Conquistas */}
      <div className={`${t.card} rounded-3xl border ${t.border} p-6`}>
        <h3 className={`font-bold text-lg ${t.text} mb-4 flex items-center gap-2`}>
          <Trophy className="w-5 h-5 text-yellow-500" />
          Conquistas
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {conquistas.map((c, i) => (
            <div 
              key={i} 
              className={`p-4 rounded-2xl text-center transition-all ${
                c.conquistada 
                  ? 'bg-gradient-to-br from-yellow-400/10 to-orange-400/10 border border-yellow-500/30' 
                  : `${darkMode ? 'bg-gray-800/50' : 'bg-gray-100'} opacity-50`
              }`}
            >
              <div className={`w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center text-3xl ${
                c.conquistada 
                  ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg' 
                  : darkMode ? 'bg-gray-700' : 'bg-gray-300'
              }`}>
                {c.icone}
              </div>
              <p className={`font-bold ${t.text} text-sm`}>{c.nome}</p>
              <p className={`text-xs ${t.textSecondary} mt-1`}>{c.descricao}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Modal de Detalhes da Rifa
  const RifaModal = ({ rifa, onClose }) => {
    const [selectedNumbers, setSelectedNumbers] = useState([]);
    const [showAllNumbers, setShowAllNumbers] = useState(false);
    
    if (!rifa) return null;

    const progresso = (rifa.numerosVendidos / rifa.totalNumeros) * 100;
    const numerosMostrar = showAllNumbers ? rifa.totalNumeros : Math.min(50, rifa.totalNumeros);

    // Simular números já vendidos (aleatório)
    const numerosVendidos = new Set();
    for (let i = 0; i < rifa.numerosVendidos; i++) {
      numerosVendidos.add(Math.floor(Math.random() * rifa.totalNumeros) + 1);
    }

    const toggleNumber = (num) => {
      if (numerosVendidos.has(num)) return;
      setSelectedNumbers(prev => 
        prev.includes(num) 
          ? prev.filter(n => n !== num)
          : [...prev, num]
      );
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className={`relative ${t.card} rounded-3xl border ${t.border} w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col`}>
          {/* Header */}
          <div className="p-6 border-b border-gray-200/50 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-violet-400/20 flex items-center justify-center text-4xl">
                {rifa.imagem}
              </div>
              <div>
                <h2 className={`text-xl font-black ${t.text}`}>{rifa.titulo}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl">{rifa.criador.avatar}</span>
                  <span className={`font-medium ${t.text}`}>{rifa.criador.nome}</span>
                  {rifa.criador.verificado && (
                    <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className={`p-2 rounded-xl ${t.card} border ${t.border} hover:bg-red-500/10 transition-colors`}
            >
              <X className={`w-5 h-5 ${t.text}`} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Progresso */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className={t.textSecondary}>{rifa.numerosVendidos}/{rifa.totalNumeros} números vendidos</span>
                <span className="font-bold text-emerald-500">{progresso.toFixed(0)}%</span>
              </div>
              <div className={`h-3 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-violet-500"
                  style={{ width: `${progresso}%` }}
                />
              </div>
            </div>

            {/* Seleção de Números */}
            <div className="mb-6">
              <h3 className={`font-bold ${t.text} mb-4`}>Escolha seus números</h3>
              <div className="grid grid-cols-10 gap-2">
                {Array.from({ length: numerosMostrar }, (_, i) => i + 1).map((num) => {
                  const vendido = numerosVendidos.has(num);
                  const selecionado = selectedNumbers.includes(num);
                  return (
                    <button
                      key={num}
                      onClick={() => toggleNumber(num)}
                      disabled={vendido}
                      className={`aspect-square rounded-lg text-sm font-bold transition-all ${
                        vendido
                          ? `${darkMode ? 'bg-gray-800' : 'bg-gray-200'} ${t.textSecondary} cursor-not-allowed opacity-50`
                          : selecionado
                            ? 'bg-gradient-to-br from-emerald-500 to-violet-500 text-white scale-110 shadow-lg'
                            : `${darkMode ? 'bg-gray-800/50' : 'bg-gray-100'} ${t.text} hover:bg-emerald-500/20`
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
              {rifa.totalNumeros > 50 && !showAllNumbers && (
                <button 
                  onClick={() => setShowAllNumbers(true)}
                  className="mt-4 w-full py-2 text-emerald-500 font-medium hover:underline"
                >
                  Mostrar todos os {rifa.totalNumeros} números
                </button>
              )}
            </div>

            {/* Legenda */}
            <div className="flex gap-6 mb-6">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded ${darkMode ? 'bg-gray-800/50' : 'bg-gray-100'}`} />
                <span className={`text-sm ${t.textSecondary}`}>Disponível</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-gradient-to-br from-emerald-500 to-violet-500" />
                <span className={`text-sm ${t.textSecondary}`}>Selecionado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} opacity-50`} />
                <span className={`text-sm ${t.textSecondary}`}>Vendido</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${t.textSecondary}`}>
                  {selectedNumbers.length} número(s) selecionado(s)
                </p>
                <p className={`text-2xl font-black ${t.text}`}>
                  Total: <span className="text-emerald-500">R$ {(selectedNumbers.length * rifa.preco).toFixed(2)}</span>
                </p>
              </div>
              <button 
                disabled={selectedNumbers.length === 0}
                className={`px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-violet-500 text-white font-semibold shadow-lg transition-all ${
                  selectedNumbers.length === 0 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105'
                }`}
              >
                Comprar com Mercado Pago
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render principal
  return (
    <div className={`min-h-screen ${t.bg} ${t.text} transition-colors duration-300`}>
      <Header />
      <Sidebar />
      <MobileMenu />
      
      <main className="pt-20 lg:pl-64 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {currentPage === 'feed' && <FeedPage />}
          {currentPage === 'marketplace' && <MarketplacePage />}
          {currentPage === 'criar' && <CriarRifaPage />}
          {currentPage === 'dashboard' && <DashboardPage />}
          {currentPage === 'perfil' && <PerfilPage />}
        </div>
      </main>

      {/* Modal de Rifa */}
      {selectedRifa && (
        <RifaModal rifa={selectedRifa} onClose={() => setSelectedRifa(null)} />
      )}

      {/* Mobile FAB */}
      <button 
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-6 right-6 lg:hidden w-14 h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-violet-500 text-white shadow-2xl shadow-emerald-500/40 flex items-center justify-center hover:scale-110 transition-transform"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};

export default RifeiApp;
