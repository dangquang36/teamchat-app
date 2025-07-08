"use client"

import { Mail, Phone, MapPin } from "lucide-react"
import { Card } from "@/components/ui/card"

export default function SupportPage() {
    return (
        <div className="w-full flex justify-center pt-10 px-4">
            <div className="max-w-xl w-full flex flex-col items-center gap-6 text-center">
                <h1 className="text-3xl font-bold text-purple-700">Liên hệ hỗ trợ</h1>
                <Card className="w-full p-6 space-y-4 shadow-md">
                    <div className="flex items-center gap-3">
                        <Phone className="text-purple-600" />
                        <span className="text-base">
                            Hỗ trợ kỹ thuật: <strong>0975 598 883</strong>
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <Mail className="text-purple-600" />
                        <span className="text-base">
                            Email liên hệ: <strong>teamduansd49@gmail.com</strong>
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <MapPin className="text-purple-600" />
                        <span className="text-base">
                            Địa chỉ: đường 247, xã Phú Lâm, huyện Tiên Du, tỉnh Bắc Ninh
                        </span>
                    </div>
                </Card>

                <div className="w-full overflow-hidden rounded-xl shadow-lg aspect-[16/9]">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3729.9876551074933!2d106.02197171417844!3d21.115440985956153!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31350381067b4735%3A0xfcc1f79eb5cb8f03!2zUGjDuiBMw6JtLCBUaWVuIER1LCBC4bqjYyBOaW5o!5e0!3m2!1svi!2s!4v1719678912373!5m2!1svi!2s"
                        width="100%"
                        height="100%"
                        loading="lazy"
                        allowFullScreen
                    ></iframe>
                </div>
            </div>
        </div>
    )
}