// withNavigate.tsx (Updated version)
import React, { ComponentType } from 'react';
import { useNavigate, NavigateFunction } from 'react-router-dom';

export interface WithNavigateProps {
  navigateToPath: (path: string) => void;
}

// Configuration interface for prop mapping
interface WithNavigateConfig {
  propName?: string;
}

function withNavigate<P>(
  WrappedComponent: ComponentType<P>,
  config: WithNavigateConfig = {}
): ComponentType<Omit<P, keyof WithNavigateProps>> {
  const { propName = 'navigateToPath' } = config;

  function ComponentWithNavigation(props: Omit<P, keyof WithNavigateProps>) {
    const navigate: NavigateFunction = useNavigate();

    const navigateToPath = (path: string): void => {
      navigate(path);
    };

    // Create navigation prop with the specified name
    const navigationProp = {
      [propName]: navigateToPath,
    } as Partial<P>;

    // Combine original props with navigation prop
    const injectedProps = {
      ...props,
      ...navigationProp,
    } as P;

    return <WrappedComponent {...injectedProps} />;
  }

  ComponentWithNavigation.displayName = `withNavigate(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return ComponentWithNavigation;
}

export default withNavigate;