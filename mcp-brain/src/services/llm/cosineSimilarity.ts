export function cosineSimilarity(A: number[], B: number[]): number {
	let dotproduct = 0;
	let mA = 0;
	let mB = 0;
	for (let i = 0; i < A.length; i++) {
		dotproduct += A[i] * B[i];
		mA += A[i] * A[i];
		mB += B[i] * B[i];
	}
	if (mA === 0 || mB === 0) return 0;
	return dotproduct / (Math.sqrt(mA) * Math.sqrt(mB));
}
