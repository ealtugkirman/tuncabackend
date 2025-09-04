'use client'

import { useState } from 'react'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { RichTextRenderer } from '@/components/ui/rich-text-renderer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export default function RichTextTestPage() {
  const [content, setContent] = useState(`
    <h1>Rich Text Editor Test</h1>
    <p>Bu bir <strong>kalın metin</strong> ve <em>italik metin</em> örneğidir.</p>
    <h2>Özellikler</h2>
    <ul>
      <li>Kalın, italik, altı çizili metin</li>
      <li>Başlıklar (H1, H2, H3)</li>
      <li>Listeler (sıralı ve sırasız)</li>
      <li>Alıntılar</li>
      <li>Kod blokları</li>
      <li>Resimler ve linkler</li>
      <li>Tablolar</li>
    </ul>
    <blockquote>
      <p>Bu bir alıntı örneğidir. Önemli bilgileri vurgulamak için kullanılır.</p>
    </blockquote>
    <h3>Kod Örneği</h3>
    <pre><code>const example = "Merhaba Dünya!";</code></pre>
    <p>Bu metin <mark>vurgulanmış</mark> ve <a href="https://example.com">link içeriyor</a>.</p>
  `)

  const handleSave = () => {
    console.log('Saved content:', content)
    alert('İçerik kaydedildi! Konsola bakın.')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Rich Text Editor Test</h1>
        <p className="text-muted-foreground">Rich text editörünü test edin</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <Card>
          <CardHeader>
            <CardTitle>Rich Text Editor</CardTitle>
            <CardDescription>İçeriğinizi burada düzenleyin</CardDescription>
          </CardHeader>
          <CardContent>
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="İçeriğinizi yazın..."
            />
            <div className="mt-4 flex gap-2">
              <Button onClick={handleSave}>
                Kaydet
              </Button>
              <Button variant="outline" onClick={() => setContent('')}>
                Temizle
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Önizleme</CardTitle>
            <CardDescription>İçeriğin nasıl görüneceği</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 min-h-[400px]">
              <RichTextRenderer content={content} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Raw HTML */}
      <Card>
        <CardHeader>
          <CardTitle>Ham HTML</CardTitle>
          <CardDescription>Oluşturulan HTML kodu</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
            <code>{content}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
