// functions/api/confirm-payment.js
// Cloudflare Pages Functions — 토스페이먼츠 결제 승인 + 접근 토큰 발급/검증
//
// [보안 핵심] 토큰은 서버만 아는 TOKEN_SIGNING_SECRET으로 HMAC 서명합니다.
// 이 비밀키를 모르면 유효한 토큰을 절대 위조할 수 없습니다.
// (결제 없이 userKey만으로 토큰을 만들 수 있던 이전 방식의 구멍을 막은 버전)

async function signUserKey(userKey, signingSecret) {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
        "raw",
        enc.encode(signingSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );
    const sigBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(userKey));
    const sigArray = new Uint8Array(sigBuffer);
    let binary = "";
    for (let i = 0; i < sigArray.length; i++) binary += String.fromCharCode(sigArray[i]);
    return btoa(binary);
}

export async function onRequestPost(context) {
    try {
        const body = await context.request.json();
        const { action, paymentKey, orderId, amount, userKey, token } = body;

        const secretKey = context.env.TOSS_SECRET_KEY;
        const signingSecret = context.env.TOKEN_SIGNING_SECRET;

        // 시크릿 키가 없으면 가짜 키로 넘어가지 않고 명확히 실패시킨다
        if (!secretKey || !signingSecret) {
            return new Response(
                JSON.stringify({ ok: false, message: "서버에 필요한 키가 설정되지 않았습니다." }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        // ------------------------------------------------------
        // 1) 재방문 유저의 토큰 유효성 검증
        // ------------------------------------------------------
        if (action === "verify") {
            if (!userKey || !token) {
                return new Response(JSON.stringify({ ok: false }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                });
            }
            const expected = await signUserKey(userKey, signingSecret);
            return new Response(JSON.stringify({ ok: token === expected }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }

        // ------------------------------------------------------
        // 2) 토스페이먼츠 결제 승인
        // ------------------------------------------------------
                if (action === "confirm") {
            if (!paymentKey || !orderId || !amount || !userKey) {
                return new Response(
                    JSON.stringify({ ok: false, message: "필수 값이 누락됐습니다." }),
                    { status: 400, headers: { "Content-Type": "application/json" } }
                );
            }

            // [보안] 클라이언트가 보낸 금액을 그대로 믿지 않는다
            if (Number(amount) !== 1900) {
                return new Response(
                    JSON.stringify({ ok: false, message: "결제 금액이 올바르지 않습니다." }),
                    { status: 400, headers: { "Content-Type": "application/json" } }
                );
            }

            const basicAuth = btoa(secretKey + ":");
            const tossResponse = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
                method: "POST",
                headers: {
                    Authorization: `Basic ${basicAuth}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ paymentKey, orderId, amount }),
            });

            const tossData = await tossResponse.json();

            if (!tossResponse.ok) {
                return new Response(
                    JSON.stringify({ ok: false, message: tossData.message || "토스 승인 오류" }),
                    { status: 400, headers: { "Content-Type": "application/json" } }
                );
            }

            // 결제가 실제로 승인된 뒤에만, 서버 비밀키로 서명된 토큰을 발급한다
            const accessToken = await signUserKey(userKey, signingSecret);
            return new Response(JSON.stringify({ ok: true, token: accessToken }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }

        return new Response(JSON.stringify({ ok: false, message: "잘못된 요청입니다." }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        return new Response(JSON.stringify({ ok: false, message: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
