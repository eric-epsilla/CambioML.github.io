'use client';
import { Icon, Key, UserCircle } from '@phosphor-icons/react';
import Container from '../Container';
import Heading from '../Heading';
import LoginButton from '../auth/LoginButton';
import LogoutButton, { LogoutButtonProps } from '../auth/LogoutButton';
import PageHero from '../hero/PageHero';
import useUserProfile from '../../hooks/useUserProfile';
import Image from 'next/image';
import { imgPrefix } from '../../hooks/useImgPrefix';
import Button from '../Button';
import useAccountStore from '@/app/hooks/useAccountStore';
import getNewApiKey from '@/app/actions/account/getNewApiKey';
import getApiKeysForUser from '@/app/actions/account/getApiKeysForUser';
import { useEffect, useState } from 'react';
import ApiKeyRow from './ApiKeyRow';
import toast from 'react-hot-toast';

interface LoadingComponentProps {
  icon: Icon;
}

const LoadingComponent = ({ icon: Icon }: LoadingComponentProps) => {
  return (
    <div className="w-full h-full bg-neutral-100 rounded-xl animate-pulse flex items-center justify-center text-neutral-600">
      <Icon size={48} />
    </div>
  );
};

interface ProfileContainerProps {
  logoutButton?: React.FC<LogoutButtonProps>;
  loginButton?: React.FC;
  profilePic?: string;
  phrase: string;
  logoutUrl?: string;
  disabled?: boolean;
}

const ProfileContainer = ({
  logoutButton: LogoutButton,
  loginButton: LoginButton,
  profilePic,
  phrase,
  logoutUrl,
  disabled,
}: ProfileContainerProps) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-between gap-8">
      <div className="w-full flex flex-col items-center justify-center gap-4">
        <Image
          src={`${profilePic || imgPrefix + '/images/default-profile.png'}`}
          alt="Profile Picture"
          width={150}
          height={150}
          className="rounded-full"
        />
        <h1 className="text-xl text-neutral-800">{phrase}</h1>
      </div>
      <div className="w-full h-[50px] flex items-center justify-center">
        {LogoutButton && <LogoutButton logoutUrl={logoutUrl || ''} disabled={disabled} />}
        {LoginButton && <LoginButton />}
      </div>
    </div>
  );
};

const AccountPageContainer = () => {
  const { profile, error, loading, token } = useUserProfile();
  const { apiKeys, setApiKeys } = useAccountStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateAPIKey = async () => {
    setIsLoading(true);
    try {
      if (!profile?.email || !token) return;
      await getNewApiKey({ clientId: profile?.email, token: token });
      fetchApiKeys();
    } catch {
      // Do nothing
    } finally {
      setIsLoading(false);
    }
  };

  const fetchApiKeys = async () => {
    if (!profile?.email || !token) return;
    try {
      const apiKeys = await getApiKeysForUser({ clientId: profile?.email, token: token });
      setApiKeys(apiKeys);
    } catch (error) {
      toast.error(`Error fetching API keys: ${error}`);
    }
  };
  useEffect(() => {
    fetchApiKeys();
  }, [profile?.sub, token]); // Add dependencies here

  return (
    <div className="pb-10 w-full h-full flex flex-col justify-center items-center">
      <PageHero title="Account" short />
      <Container styles="h-[50vh] min-h-[1000px] py-10 w-[850px]">
        <div className="w-full h-full flex flex-col gap-12">
          <div>
            <Heading title="Profile" />
            <div className="w-full h-[275px] flex flex-col items-center justify-center">
              {loading && <LoadingComponent icon={UserCircle} />}
              {!loading && error && (
                <ProfileContainer
                  loginButton={LoginButton}
                  profilePic={imgPrefix + '/images/default-profile.png'}
                  phrase={`Error loading user profile: ${error}`}
                />
              )}
              {!loading && !error && !profile && (
                <ProfileContainer
                  loginButton={LoginButton}
                  profilePic={imgPrefix + '/images/default-profile.png'}
                  phrase="Please log in."
                />
              )}
              {!loading && !error && profile && (
                <ProfileContainer
                  logoutButton={LogoutButton}
                  profilePic={profile.picture}
                  phrase={`Welcome, ${profile.name}`}
                  logoutUrl={process.env.NEXT_PUBLIC_LOGOUT_URL_ACCOUNT || 'https://www.cambioml.com/account'}
                  disabled={isLoading}
                />
              )}
            </div>
          </div>
          <div>
            <Heading title="API Keys" />
            <div className="w-full h-[300px] flex flex-col items-center gap-8">
              {loading && <LoadingComponent icon={Key} />}
              {!loading && error && (
                <>
                  <div>Error loading user profile: {error}</div>
                </>
              )}
              {!loading && !error && !profile && (
                <div className="w-full h-full bg-neutral-100 rounded-xl flex items-center justify-center">
                  <Key size={48} />
                </div>
              )}
              {!loading && !error && profile && (
                <div className="w-full h-full flex flex-col items-start justify-start gap-8">
                  Generate and copy your API keys.
                  <div className="w-full h-[50px]">
                    <Button
                      label={`${isLoading ? 'Generating...' : 'Generate New API Key'}`}
                      onClick={handleGenerateAPIKey}
                      small
                      disabled={isLoading}
                    />
                  </div>
                  <div className="w-full">
                    <div className="text-xl font-semibold pb-4">Your Keys</div>
                    <div className="flex flex-col gap-2 h-[350px] overflow-auto">
                      {apiKeys.length === 0 && (
                        <div className="w-full h-full bg-neutral-100 rounded-xl flex items-center justify-center">
                          <Key size={48} />
                        </div>
                      )}
                      {apiKeys.length > 0 && apiKeys.map((key, i) => <ApiKeyRow key={i} apiKey={key} />)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default AccountPageContainer;