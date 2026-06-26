import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout(): React.ReactElement | null {
	return React.createElement(
		Stack,
		{ screenOptions: { headerShown: false } },
		React.createElement(Stack.Screen, { name: 'login' }),
			React.createElement(Stack.Screen, { name: 'register', options: { animation: 'fade' } })
	);
}
