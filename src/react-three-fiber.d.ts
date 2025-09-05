/// <reference types="@react-three/fiber" />

import { ThreeElements } from '@react-three/fiber';

declare module 'react' {
    namespace JSX {
        interface IntrinsicElements extends ThreeElements { }
    }
}