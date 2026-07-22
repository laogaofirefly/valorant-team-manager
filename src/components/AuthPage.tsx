// 登录/注册页面

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { VCTCard, VCTCardContent, VCTButton } from '@/components/ui';

type AuthMode = 'login' | 'register';

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');

  const { login, register, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === 'login') {
        await login(username, password);
      } else {
        await register(username, email, password, nickname || undefined);
      }
    } catch {
      // 错误已经存储在authStore中
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    clearError();
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 bg-[radial-gradient(circle_at_center,rgba(255,70,85,0.05)_0%,transparent_50%)]">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-oswald text-5xl font-bold text-white tracking-widest">
            VCT <span className="text-red-500">MANAGER</span>
          </h1>
          <p className="text-gray-400 mt-2 font-rajdhani tracking-wider">
            无畏契约战队经营模拟
          </p>
        </div>

        <VCTCard variant="highlight" className="p-6">
          <div className="flex mb-6 border-b border-gray-800">
            <button
              onClick={() => switchMode('login')}
              className={`flex-1 pb-3 font-rajdhani font-bold uppercase tracking-wider transition-colors ${
                mode === 'login'
                  ? 'text-white border-b-2 border-red-500'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              登录
            </button>
            <button
              onClick={() => switchMode('register')}
              className={`flex-1 pb-3 font-rajdhani font-bold uppercase tracking-wider transition-colors ${
                mode === 'register'
                  ? 'text-white border-b-2 border-red-500'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              注册
            </button>
          </div>

          <VCTCardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2 font-rajdhani uppercase tracking-wider">
                  用户名
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  maxLength={20}
                  className="w-full bg-gray-900 border border-gray-700 px-4 py-2 text-white font-rajdhani focus:border-red-500 focus:outline-none transition-colors"
                  placeholder="请输入用户名"
                />
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2 font-rajdhani uppercase tracking-wider">
                    邮箱
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-gray-900 border border-gray-700 px-4 py-2 text-white font-rajdhani focus:border-red-500 focus:outline-none transition-colors"
                    placeholder="请输入邮箱"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-400 mb-2 font-rajdhani uppercase tracking-wider">
                  密码
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-gray-900 border border-gray-700 px-4 py-2 text-white font-rajdhani focus:border-red-500 focus:outline-none transition-colors"
                  placeholder="至少6个字符"
                />
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2 font-rajdhani uppercase tracking-wider">
                    昵称 (可选)
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    maxLength={20}
                    className="w-full bg-gray-900 border border-gray-700 px-4 py-2 text-white font-rajdhani focus:border-red-500 focus:outline-none transition-colors"
                    placeholder="显示名称"
                  />
                </div>
              )}

              {error && (
                <div className="bg-red-900/30 border border-red-700 px-3 py-2 text-red-300 text-sm">
                  {error}
                </div>
              )}

              <VCTButton
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isLoading}
                icon={mode === 'login' ? '→' : '+'}
              >
                {mode === 'login' ? '登录' : '注册'}
              </VCTButton>
            </form>
          </VCTCardContent>
        </VCTCard>

        <div className="mt-6 text-center text-gray-500 text-sm">
          {mode === 'login' ? (
            <span>还没有账号？</span>
          ) : (
            <span>已有账号？</span>
          )}
          <button
            onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
            className="text-red-500 hover:text-red-400 ml-1 font-bold"
          >
            {mode === 'login' ? '立即注册' : '前往登录'}
          </button>
        </div>
      </div>
    </div>
  );
}
