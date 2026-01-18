import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { pdf } from '@react-pdf/renderer';
import PDFDocument from '@/components/PDFDocument';

interface ChecklistItem {
  id: string;
  title: string;
  regulation: string;
  compliance: 'compliant' | 'non-compliant' | 'not-checked';
  comment: string;
  photos: string[];
}

interface SavedInspection {
  id: number;
  address: string;
  inspectionDate: string;
  createdAt: string;
}

interface CommentTemplate {
  id: number;
  category: string;
  text: string;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState('new');
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [address, setAddress] = useState('');
  const [currentInspectionId, setCurrentInspectionId] = useState<number | null>(null);
  const [savedInspections, setSavedInspections] = useState<SavedInspection[]>([]);
  const [templates, setTemplates] = useState<CommentTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: '1', title: 'Сантехника', regulation: 'СП 30.13330.2020, ГОСТ 23289-94', compliance: 'not-checked', comment: '', photos: [] },
    { id: '2', title: 'Отопление', regulation: 'СП 60.13330.2020, ГОСТ 30494-2011', compliance: 'not-checked', comment: '', photos: [] },
    { id: '3', title: 'Двери', regulation: 'ГОСТ 31173-2016, СП 54.13330.2016', compliance: 'not-checked', comment: '', photos: [] },
    { id: '4', title: 'Электрика', regulation: 'ПУЭ 7, ГОСТ Р 50571.1-2009', compliance: 'not-checked', comment: '', photos: [] },
    { id: '5', title: 'Штукатурка', regulation: 'СП 71.13330.2017, ГОСТ 31724-2012', compliance: 'not-checked', comment: '', photos: [] },
    { id: '6', title: 'Вентиляция', regulation: 'СП 60.13330.2020, ГОСТ 30494-2011', compliance: 'not-checked', comment: '', photos: [] },
    { id: '7', title: 'Уровни пола и стен', regulation: 'СП 71.13330.2017, СНиП 3.04.01-87', compliance: 'not-checked', comment: '', photos: [] },
    { id: '8', title: 'Окна', regulation: 'ГОСТ 30971-2012, СП 23-101-2004', compliance: 'not-checked', comment: '', photos: [] },
    { id: '9', title: 'Ограждения (балконы/террасы)', regulation: 'ГОСТ 25772-83, СП 54.13330.2016', compliance: 'not-checked', comment: '', photos: [] },
    { id: '10', title: 'Фасад', regulation: 'СП 293.1325800.2017, ГОСТ 31310-2015', compliance: 'not-checked', comment: '', photos: [] },
  ]);

  useEffect(() => {
    loadInspections();
    loadTemplates();
  }, []);

  const loadInspections = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/c6191be1-dfbc-4163-aa3e-427e88139a7d');
      const data = await response.json();
      setSavedInspections(data);
    } catch (error) {
      toast.error('Ошибка загрузки актов');
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/9fac0cee-8612-4b6c-a6cd-289f1a6b82e9');
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      toast.error('Ошибка загрузки шаблонов');
    }
  };

  const loadInspection = async (id: number) => {
    try {
      const response = await fetch(`https://functions.poehali.dev/c6191be1-dfbc-4163-aa3e-427e88139a7d?id=${id}`);
      const data = await response.json();
      
      setAddress(data.address);
      setInspectionDate(data.inspectionDate);
      setChecklist(data.checklist);
      setCurrentInspectionId(id);
      setActiveTab('new');
      
      toast.success('Акт загружен');
    } catch (error) {
      toast.error('Ошибка загрузки акта');
    }
  };

  const saveInspection = async () => {
    const data = {
      address,
      inspectionDate,
      checklist
    };

    try {
      if (currentInspectionId) {
        await fetch('https://functions.poehali.dev/c6191be1-dfbc-4163-aa3e-427e88139a7d', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, id: currentInspectionId })
        });
        toast.success('Акт обновлен');
      } else {
        const response = await fetch('https://functions.poehali.dev/c6191be1-dfbc-4163-aa3e-427e88139a7d', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const result = await response.json();
        setCurrentInspectionId(result.id);
        toast.success('Акт сохранен');
      }
      loadInspections();
    } catch (error) {
      toast.error('Ошибка сохранения');
    }
  };

  const deleteInspection = async (id: number) => {
    try {
      await fetch(`https://functions.poehali.dev/c6191be1-dfbc-4163-aa3e-427e88139a7d?id=${id}`, {
        method: 'DELETE'
      });
      toast.success('Акт удален');
      loadInspections();
      
      if (currentInspectionId === id) {
        setCurrentInspectionId(null);
        setAddress('');
        setChecklist(checklist.map(item => ({ ...item, compliance: 'not-checked' as const, comment: '', photos: [] })));
      }
    } catch (error) {
      toast.error('Ошибка удаления');
    }
  };

  const handleComplianceChange = (id: string, value: 'compliant' | 'non-compliant' | 'not-checked') => {
    setChecklist(checklist.map(item => 
      item.id === id ? { ...item, compliance: value } : item
    ));
  };

  const handleCommentChange = (id: string, comment: string) => {
    setChecklist(checklist.map(item => 
      item.id === id ? { ...item, comment } : item
    ));
  };

  const handlePhotoUpload = (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const readers: Promise<string>[] = [];
    
    Array.from(files).forEach(file => {
      readers.push(new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      }));
    });

    Promise.all(readers).then(photos => {
      setChecklist(checklist.map(item => 
        item.id === id ? { ...item, photos: [...item.photos, ...photos] } : item
      ));
    });
  };

  const removePhoto = (itemId: string, photoIndex: number) => {
    setChecklist(checklist.map(item => 
      item.id === itemId ? { ...item, photos: item.photos.filter((_, i) => i !== photoIndex) } : item
    ));
  };

  const applyTemplate = (itemId: string, templateText: string) => {
    setChecklist(checklist.map(item => 
      item.id === itemId ? { ...item, comment: item.comment ? `${item.comment}\n${templateText}` : templateText } : item
    ));
  };

  const exportToPDF = async () => {
    toast.info('Формирование PDF...');

    try {
      const doc = <PDFDocument address={address} inspectionDate={inspectionDate} checklist={checklist} />;
      const blob = await pdf(doc).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Акт_осмотра_${inspectionDate}.pdf`;
      link.click();
      
      URL.revokeObjectURL(url);
      toast.success('PDF сохранен');
    } catch (error) {
      toast.error('Ошибка формирования PDF');
      console.error(error);
    }
  };

  const filteredTemplates = selectedCategory 
    ? templates.filter(t => t.category === selectedCategory)
    : [];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">Акты осмотра квартир</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="new">
              <Icon name="FileText" size={18} className="mr-2" />
              {currentInspectionId ? 'Редактировать' : 'Новый акт'}
            </TabsTrigger>
            <TabsTrigger value="history">
              <Icon name="History" size={18} className="mr-2" />
              История актов
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="space-y-6">
            <div className="flex gap-2">
              <Button onClick={saveInspection} className="gap-2">
                <Icon name="Save" size={20} />
                Сохранить акт
              </Button>
              <Button onClick={exportToPDF} variant="outline" className="gap-2">
                <Icon name="Download" size={20} />
                Экспорт в PDF
              </Button>
              {currentInspectionId && (
                <Button 
                  onClick={() => {
                    setCurrentInspectionId(null);
                    setAddress('');
                    setChecklist(checklist.map(item => ({ ...item, compliance: 'not-checked' as const, comment: '', photos: [] })));
                  }} 
                  variant="ghost"
                >
                  Новый акт
                </Button>
              )}
            </div>

            <div id="inspection-report" className="bg-white p-8 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Данные инспектора</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-semibold">ИП:</p>
                      <p>Шилохвостов Владислав Дмитриевич</p>
                    </div>
                    <div>
                      <p className="font-semibold">ИНН:</p>
                      <p>860236335706</p>
                    </div>
                    <div className="col-span-2">
                      <p className="font-semibold">ОГРНИП:</p>
                      <p>325861700037662</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Данные осмотра</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Адрес / Объект приёмки</Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Введите адрес объекта"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Дата приёмки</Label>
                    <Input
                      id="date"
                      type="date"
                      value={inspectionDate}
                      onChange={(e) => setInspectionDate(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Результаты проверки</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {checklist.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 space-y-4">
                      <div className="space-y-3">
                        <div className="flex-1 space-y-1">
                          <h3 className="text-base font-semibold">{item.title}</h3>
                          <p className="text-xs text-muted-foreground">{item.regulation}</p>
                        </div>

                        <RadioGroup 
                          value={item.compliance} 
                          onValueChange={(value) => handleComplianceChange(item.id, value as 'compliant' | 'non-compliant' | 'not-checked')}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="compliant" id={`compliant-${item.id}`} />
                            <Label htmlFor={`compliant-${item.id}`} className="cursor-pointer font-normal">
                              ✓ Соответствует нормам
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="non-compliant" id={`non-compliant-${item.id}`} />
                            <Label htmlFor={`non-compliant-${item.id}`} className="cursor-pointer font-normal">
                              ✗ Не соответствует нормам
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Select 
                            value={selectedCategory} 
                            onValueChange={(value) => {
                              setSelectedCategory(value);
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Выбрать шаблон замечания" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={item.title}>{item.title}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {selectedCategory === item.title && filteredTemplates.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {filteredTemplates.map(template => (
                              <Button
                                key={template.id}
                                variant="outline"
                                size="sm"
                                onClick={() => applyTemplate(item.id, template.text)}
                                className="text-xs"
                              >
                                {template.text}
                              </Button>
                            ))}
                          </div>
                        )}

                        <Textarea
                          placeholder="Замечания (если есть)"
                          value={item.comment}
                          onChange={(e) => handleCommentChange(item.id, e.target.value)}
                          rows={3}
                        />

                        <div className="space-y-2">
                          <Label htmlFor={`photo-${item.id}`} className="cursor-pointer">
                            <div className="flex items-center gap-2 text-sm text-accent hover:underline">
                              <Icon name="Camera" size={16} />
                              Добавить фото
                            </div>
                          </Label>
                          <Input
                            id={`photo-${item.id}`}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => handlePhotoUpload(item.id, e)}
                          />

                          {item.photos.length > 0 && (
                            <div className="grid grid-cols-3 gap-2">
                              {item.photos.map((photo, index) => (
                                <div key={index} className="relative group">
                                  <img 
                                    src={photo} 
                                    alt={`Фото ${index + 1}`} 
                                    className="w-full h-24 object-cover rounded border"
                                  />
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => removePhoto(item.id, index)}
                                  >
                                    <Icon name="X" size={14} />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="text-xs text-muted-foreground text-center pt-4">
                <p>Дата формирования акта: {new Date().toLocaleDateString('ru-RU')}</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {savedInspections.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <Icon name="FileText" size={48} className="mx-auto mb-4 opacity-30" />
                  <p>Нет сохраненных актов</p>
                </CardContent>
              </Card>
            ) : (
              savedInspections.map(inspection => (
                <Card key={inspection.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="font-semibold">{inspection.address}</p>
                        <p className="text-sm text-muted-foreground">
                          Дата осмотра: {new Date(inspection.inspectionDate).toLocaleDateString('ru-RU')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Создан: {new Date(inspection.createdAt).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => loadInspection(inspection.id)}
                        >
                          <Icon name="FileEdit" size={16} />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => deleteInspection(inspection.id)}
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;