import React, { useEffect, useRef } from 'react';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    baseX: number;
    baseY: number;
    density: number;
}

const COLORS = [
    'rgba(34, 255, 225, 0.78)',  // Teal
    'rgba(134, 6, 255, 0.6)',  // Purple
    'rgba(228, 51, 51, 0.69)', // Soft white
];

const AntigravityParticles: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2, radius: 150 });
    const animationFrameRef = useRef<number>();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let particles: Particle[] = [];

        const initParticles = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            particles = [];

            const numberOfParticles = Math.floor((canvas.width * canvas.height) / 18000);

            for (let i = 0; i < numberOfParticles; i++) {
                const size = Math.random() * 2.0 + 1.0;
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                const angle = Math.random() * Math.PI * 2;
                const speed = 0.24 + Math.random() * 0.18; // a bit faster than before

                particles.push({
                    x,
                    y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    size,
                    color: COLORS[Math.floor(Math.random() * COLORS.length)],
                    baseX: x,
                    baseY: y,
                    density: 8 + Math.random() * 24,
                });
            }
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                // Drift back towards base position
                const toBaseX = (p.baseX - p.x) * 0.005;
                const toBaseY = (p.baseY - p.y) * 0.005;
                p.vx += toBaseX;
                p.vy += toBaseY;

                // Mouse attraction
                const dx = mouseRef.current.x - p.x;
                const dy = mouseRef.current.y - p.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouseRef.current.radius) {
                    const force = (mouseRef.current.radius - distance) / mouseRef.current.radius;
                    const fx = (dx / distance || 0) * force * p.density * 0.02; // slightly stronger
                    const fy = (dy / distance || 0) * force * p.density * 0.02;
                    p.vx += fx;
                    p.vy += fy;
                }

                // Position + friction
                p.x += p.vx;
                p.y += p.vy;
                p.vx *= 0.985; // less friction -> quicker but still smooth
                p.vy *= 0.985;

                // Soft wrap around edges
                if (p.x < -40) p.x = canvas.width + 40;
                if (p.x > canvas.width + 40) p.x = -40;
                if (p.y < -40) p.y = canvas.height + 40;
                if (p.y > canvas.height + 40) p.y = -40;

                // Particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 8;
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            // Connections
            for (let i = 0; i < particles.length; i++) {
                const p1 = particles[i];
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        const alpha = 0.2 - dist / 600;
                        if (alpha > 0) {
                            ctx.strokeStyle = `rgba(200, 220, 255, ${alpha})`;
                            ctx.lineWidth = 0.7;
                            ctx.beginPath();
                            ctx.moveTo(p1.x, p1.y);
                            ctx.lineTo(p2.x, p2.y);
                            ctx.stroke();
                        }
                    }
                }
            }

            animationFrameRef.current = requestAnimationFrame(draw);
        };

        const handleResize = () => {
            initParticles();
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current.x = e.clientX;
            mouseRef.current.y = e.clientY;
        };

        initParticles();
        draw();

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ width: '100%', height: '100%', opacity: 0.85 }}
            aria-hidden="true"
        />
    );
};

export default AntigravityParticles;

