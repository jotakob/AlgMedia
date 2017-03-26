"use strict";
var Field = {}
var viscosity = 0.001

function preload()
{

}

function setup()
{
    Field.u = new Array(256*256)
    Field.v = new Array(256*256)
    Field.u0 = new Array(256*258)
    Field.v0 = new Array(256*258)
    Field.addForce = new function(x, y, force) {

    }

    for (var i = 0; i < Field.u.length; i++) {
        Field.u[i] = 0
        Field.v[i] = 0
        Field.u0[i] = 0
        Field.v0[i] = 0
    }
    frameRate(30)
    createCanvas(256, 256)
}

function draw()
{
    clear()
    Field.u0[256*128] = 10
    solve(256, Field.u, Field.v, Field.u0, Field.v0, viscosity, 1000/30)
    if (mouseIsPressed) {

    }

    var n = Field.u.length
    for (var i = 0; i < n; i++) {
        var force = sqrt(pow(Field.u[i], 2) + pow(Field.v[i], 2))
        var s = 255 * 1-(force/10)
        stroke(s)
        point(i%256, floor(i/256))
    }
}

function windowResized()
{
    //resizeCanvas(windowWidth, windowHeight)
}





/* Fluid stuff
 * from http://www.dgp.toronto.edu/people/stam/reality/Research/pdf/jgt01.pdf
 */

function solve ( n, u, v, u0, v0, visc, dt)
{
    var x, y, x0, y0, f, r, s, t
    var i, j, i0, j0, i1, j1;
    var U = new Array(2)
    var V = new Array(2)

    for ( i=0 ; i<n*n ; i++ ) {
        u[i] += dt*u0[i]
        u0[i] = u[i]
        v[i] += dt*v0[i]
        v0[i] = v[i]
    }

    for ( x=0.5/n,i=0 ; i<n ; i++,x+=1.0/n ) {
        for ( y=0.5/n,j=0 ; j<n ; j++,y+=1.0/n ) {
            x0 = n*(x-dt*u0[i+n*j])-0.5;
            y0 = n*(y-dt*v0[i+n*j])-0.5;
            i0 = floor(x0); s = x0-i0;
            i0 = (n+(i0%n))%n; i1 = (i0+1)%n;
            j0 = floor(y0); t = y0-j0;
            j0 = (n+(j0%n))%n; j1 = (j0+1)%n;
            u[i+n*j] = (1-s)*((1-t)*u0[i0+n*j0]+t*u0[i0+n*j1]) + s *((1-t)*u0[i1+n*j0]+t*u0[i1+n*j1]);
            v[i+n*j] = (1-s)*((1-t)*v0[i0+n*j0]+t*v0[i0+n*j1]) + s *((1-t)*v0[i1+n*j0]+t*v0[i1+n*j1]);
        }
    }

    for ( i=0 ; i<n ; i++ ) {
        for ( j=0 ; j<n ; j++ ) {
            u0[i+(n+2)*j] = u[i+n*j]
            v0[i+(n+2)*j] = v[i+n*j]
        }
    }

    FFT(u0,zeroArray(256*258)); //FFT_r2c
    FFT(v0,zeroArray(256*258));

    for ( i=0 ; i<=n ; i+=2 ) {
        x = 0.5*i;
        for ( j=0 ; j<n ; j++ ) {
            y = j<=n/2 ? j : j-n;
            r = x*x+y*y;
            if ( r !=0.0 ) {
                f = exp(-r*dt*visc);
                U[0] = u0[i +(n+2)*j];
                V[0] = v0[i +(n+2)*j];
                U[1] = u0[i+1+(n+2)*j];
                V[1] = v0[i+1+(n+2)*j];
                u0[i +(n+2)*j] = f*( (1-x*x/r)*U[0] -x*y/r *V[0] );
                u0[i+1+(n+2)*j] = f*( (1-x*x/r)*U[1] -x*y/r *V[1] );
                v0[i+ (n+2)*j] = f*( -y*x/r *U[0] + (1-y*y/r)*V[0] );
                v0[i+1+(n+2)*j] = f*( -y*x/r *U[1] + (1-y*y/r)*V[1] );
            }
        }
    }

    iFFT(u0,zeroArray(256*258)); //FFT_c2r
    iFFT(v0,zeroArray(256*258));

    f = 1.0/(n*n);
    for ( i=0 ; i<n ; i++ ) {
        for ( j=0 ; j<n ; j++ ) {
            u[i+n*j] = f*u0[i+(n+2)*j];
            v[i+n*j] = f*v0[i+(n+2)*j];
        }
    }
}

/*
 * Free FFT and convolution (JavaScript)
 *
 * Copyright (c) 2014 Project Nayuki
 * https://www.nayuki.io/page/free-small-fft-in-multiple-languages
 *
 * (MIT License)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 * - The above copyright notice and this permission notice shall be included in
 *   all copies or substantial portions of the Software.
 * - The Software is provided "as is", without warranty of any kind, express or
 *   implied, including but not limited to the warranties of merchantability,
 *   fitness for a particular purpose and noninfringement. In no event shall the
 *   authors or copyright holders be liable for any claim, damages or other
 *   liability, whether in an action of contract, tort or otherwise, arising from,
 *   out of or in connection with the Software or the use or other dealings in the
 *   Software.
 */



/*
 * Computes the discrete Fourier transform (DFT) of the given complex vector, storing the result back into the vector.
 * The vector can have any length. This is a wrapper function.
 */
function FFT(real, imag) {
    if (real.length != imag.length)
        throw "Mismatched lengths";

    var n = real.length;
    if (n == 0)
        return;
    else if ((n & (n - 1)) == 0)  // Is power of 2
        transformRadix2(real, imag);
    else  // More complicated algorithm for arbitrary sizes
        transformBluestein(real, imag);
}


/*
 * Computes the inverse discrete Fourier transform (IDFT) of the given complex vector, storing the result back into the vector.
 * The vector can have any length. This is a wrapper function. This transform does not perform scaling, so the inverse is not a true inverse.
 */
function iFFT(real, imag) {
    FFT(imag, real);
}


/*
 * Computes the discrete Fourier transform (DFT) of the given complex vector, storing the result back into the vector.
 * The vector's length must be a power of 2. Uses the Cooley-Tukey decimation-in-time radix-2 algorithm.
 */
function transformRadix2(real, imag) {
    // Initialization
    if (real.length != imag.length)
        throw "Mismatched lengths";
    var n = real.length;
    if (n == 1) { // Trivial transform
        return;
    }
    var levels = -1;
    for (var i = 0; i < 32; i++) {
        if (1 << i == n)
            levels = i;  // Equal to log2(n)
    }
    if (levels == -1) {
        throw "Length is not a power of 2";
    }
    var cosTable = new Array(n / 2);
    var sinTable = new Array(n / 2);
    for (var i = 0; i < n / 2; i++) {
        cosTable[i] = Math.cos(2 * Math.PI * i / n);
        sinTable[i] = Math.sin(2 * Math.PI * i / n);
    }

    // Bit-reversed addressing permutation
    for (var i = 0; i < n; i++) {
        var j = reverseBits(i, levels);
        if (j > i) {
            var temp = real[i];
            real[i] = real[j];
            real[j] = temp;
            temp = imag[i];
            imag[i] = imag[j];
            imag[j] = temp;
        }
    }

    // Cooley-Tukey decimation-in-time radix-2 FFT
    for (var size = 2; size <= n; size *= 2) {
        var halfsize = size / 2;
        var tablestep = n / size;
        for (var i = 0; i < n; i += size) {
            for (var j = i, k = 0; j < i + halfsize; j++, k += tablestep) {
                var tpre =  real[j+halfsize] * cosTable[k] + imag[j+halfsize] * sinTable[k];
                var tpim = -real[j+halfsize] * sinTable[k] + imag[j+halfsize] * cosTable[k];
                if (tpre == NaN)
                {
                    throw "NaN exception"
                }
                real[j + halfsize] = real[j] - tpre;
                imag[j + halfsize] = imag[j] - tpim;
                real[j] += tpre;
                imag[j] += tpim;
            }
        }
    }

    // Returns the integer whose value is the reverse of the lowest 'bits' bits of the integer 'x'.
    function reverseBits(x, bits) {
        var y = 0;
        for (var i = 0; i < bits; i++) {
            y = (y << 1) | (x & 1);
            x >>>= 1;
        }
        return y;
    }
}


/*
 * Computes the discrete Fourier transform (DFT) of the given complex vector, storing the result back into the vector.
 * The vector can have any length. This requires the convolution function, which in turn requires the radix-2 FFT function.
 * Uses Bluestein's chirp z-transform algorithm.
 */
function transformBluestein(real, imag) {
    // Find a power-of-2 convolution length m such that m >= n * 2 + 1
    if (real.length != imag.length)
        throw "Mismatched lengths";
    var n = real.length;
    var m = 1;
    while (m < n * 2 + 1)
        m *= 2;

    // Trignometric tables
    var cosTable = new Array(n);
    var sinTable = new Array(n);
    for (var i = 0; i < n; i++) {
        var j = i * i % (n * 2);  // This is more accurate than j = i * i
        cosTable[i] = Math.cos(Math.PI * j / n);
        sinTable[i] = Math.sin(Math.PI * j / n);
    }

    // Temporary vectors and preprocessing
    var areal = new Array(m);
    var aimag = new Array(m);
    for (var i = 0; i < n; i++) {
        areal[i] =  real[i] * cosTable[i] + imag[i] * sinTable[i];
        aimag[i] = -real[i] * sinTable[i] + imag[i] * cosTable[i];
    }
    for (var i = n; i < m; i++)
        areal[i] = aimag[i] = 0;
    var breal = new Array(m);
    var bimag = new Array(m);
    breal[0] = cosTable[0];
    bimag[0] = sinTable[0];
    for (var i = 1; i < n; i++) {
        breal[i] = breal[m - i] = cosTable[i];
        bimag[i] = bimag[m - i] = sinTable[i];
    }
    for (var i = n; i <= m - n; i++)
        breal[i] = bimag[i] = 0;

    // Convolution
    var creal = new Array(m);
    var cimag = new Array(m);
    convolveComplex(areal, aimag, breal, bimag, creal, cimag);

    // Postprocessing
    for (var i = 0; i < n; i++) {
        real[i] =  creal[i] * cosTable[i] + cimag[i] * sinTable[i];
        imag[i] = -creal[i] * sinTable[i] + cimag[i] * cosTable[i];
    }
}


/*
 * Computes the circular convolution of the given real vectors. Each vector's length must be the same.
 */
function convolveReal(x, y, out) {
    if (x.length != y.length || x.length != out.length)
        throw "Mismatched lengths";
    var zeros = new Array(x.length);
    for (var i = 0; i < zeros.length; i++)
        zeros[i] = 0;
    convolveComplex(x, zeros, y, zeros.slice(), out, zeros.slice());
}


/*
 * Computes the circular convolution of the given complex vectors. Each vector's length must be the same.
 */
function convolveComplex(xreal, ximag, yreal, yimag, outreal, outimag) {
    if (xreal.length != ximag.length || xreal.length != yreal.length || yreal.length != yimag.length || xreal.length != outreal.length || outreal.length != outimag.length)
        throw "Mismatched lengths";

    var n = xreal.length;
    xreal = xreal.slice();
    ximag = ximag.slice();
    yreal = yreal.slice();
    yimag = yimag.slice();

    FFT(xreal, ximag);
    FFT(yreal, yimag);
    for (var i = 0; i < n; i++) {
        var temp = xreal[i] * yreal[i] - ximag[i] * yimag[i];
        ximag[i] = ximag[i] * yreal[i] + xreal[i] * yimag[i];
        xreal[i] = temp;
    }
    iFFT(xreal, ximag);
    for (var i = 0; i < n; i++) {  // Scaling (because this FFT implementation omits it)
        outreal[i] = xreal[i] / n;
        outimag[i] = ximag[i] / n;
    }
}

/* End Nayuki FFT */

function zeroArray(size)
{
    var ret = new Array(size)
    for (var i = 0; i < ret.length; i++) {
        ret[i] = 0
    }
    return ret
}
